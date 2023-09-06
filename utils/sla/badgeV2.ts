import * as anchor from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor"
import * as mpl from "@metaplex/js"

import { HAY_MINT, SlaBadge, SLA_BADGES, SLA_HAY_TREASURY_WALLET, SLA_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID } from "../constants";
import idl from '../../sla_idl.json'
import { getBadgeSupplyCounter, getSlaRankingV2Pda, getSlaRankingV1Pda, getSlaTreasuryPda } from "./accounts";
import { findAssociatedTokenAddress } from "./utils";
import { sendTransaction } from "../transaction";
import { NFT } from "../../hooks/useWalletNFTs";
import { BadgeAccountV1 } from "./badgeV1";


export interface BadgeAccountV2 {
  ranking: any,
  bronzeMinted: boolean,
  silverMinted: boolean,
  goldMinted: boolean,
  platinumMinted: boolean,
  diamondMinted: boolean,
}


export async function getBadgeAccountV2(
  wallet: Wallet,
  connection: anchor.web3.Connection,
  rankingV2Pda: anchor.web3.PublicKey,
): Promise<any> {

  // Initialize a connection to SLA program
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: 'processed',
    commitment: "processed",
  })

  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  try {
    const ranking = await program.account.rankingV2.fetch(rankingV2Pda)
    return ranking
  } catch (error: any) {
    console.log(error)
    return null
  }
}


export function badgeAccountV2ToBadgeInfo(badgeAccountV2: BadgeAccountV2): SlaBadge | null {

  if (!badgeAccountV2 || !badgeAccountV2.ranking) { return null }

  // The Rust Enum has fields following the pattern "badgeBronze"
  const filtered = SLA_BADGES.filter(b => `badge${b.name}` in badgeAccountV2.ranking)

  if (filtered.length > 0) {
    return filtered[0]
  } else {
    return null
  }
}


export function hasAgentAlreadyMintedBadge(
  badgeToMint: SlaBadge,
  badgeAccountV2: BadgeAccountV2 | null
): boolean {

  // Use the V2 ranking account if it exists 
  if (badgeAccountV2) {

    // No ranking yet
    if (!badgeAccountV2.ranking) {
      return badgeAccountV2.bronzeMinted
    }

    switch (badgeToMint.id) {
      case 2:
        return badgeAccountV2.bronzeMinted
      case 3:
        return badgeAccountV2.silverMinted
      case 4:
        return badgeAccountV2.goldMinted
      case 5:
        return badgeAccountV2.platinumMinted
      case 6:
        return badgeAccountV2.diamondMinted
      default:
        return true
    }
  }

  return false
}


export function hasAgentReachedRequiredGradeToMint(
  badgeToMint: SlaBadge,
  badgeAccountV1: BadgeAccountV1 | null,
  badgeAccountV2: BadgeAccountV2 | null
): boolean {
// console.log({badgeAccountV1})
// console.log({badgeAccountV2})
  // Use the V2 ranking account if it exists 

  if (badgeAccountV2 && badgeAccountV2.ranking) {
    // console.log({badgeAccountV1})

    switch (badgeToMint.id) {
      case 2:
        return true
      case 3:
        return 'badgeBronze' in badgeAccountV2.ranking
      case 4:
        return 'badgeSilver' in badgeAccountV2.ranking
      case 5:
        return 'badgeGold' in badgeAccountV2.ranking
      case 6:
        return 'badgePlatinum' in badgeAccountV2.ranking
      default:
        return false
    }
  }

  // Otherwise, use the information from the V1 account
  else if (badgeAccountV1 && badgeAccountV1.ranking) {
    // console.log(' asdaf is v1')

    if ('badgeBronze' in badgeAccountV1.ranking) {
      return badgeToMint.id === 3
    } else if ('badgeSilver' in badgeAccountV1.ranking) {
      return badgeToMint.id === 4
    } else if ('badgeGold' in badgeAccountV1.ranking) {
      return badgeToMint.id === 5
    } else if ('badgePlatinum' in badgeAccountV1.ranking) {
      return badgeToMint.id === 6
    } else {
      return false
    }
  }

  // If neither account exists or if the ranks are None, only Bronze can be minted
  else {
    return badgeToMint.id === 2
  }
}


export async function mintBadge(
  wallet: Wallet,
  connection: anchor.web3.Connection,
  badgeToMint: SlaBadge,
  agentMint: anchor.web3.PublicKey,
): Promise<string> {

  // Initialize a connection to SLA program
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: 'processed',
  })

  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const badgeMint = new anchor.web3.PublicKey(badgeToMint.mint)
  const [treasuryPda, treasuryBump] = await getSlaTreasuryPda()
  const ata = findAssociatedTokenAddress(wallet.publicKey, badgeMint)
  const hayUserAta = findAssociatedTokenAddress(wallet.publicKey, HAY_MINT)
  const hayTreasuryAta = findAssociatedTokenAddress(SLA_HAY_TREASURY_WALLET, HAY_MINT)
  const avatarToken = findAssociatedTokenAddress(wallet.publicKey, agentMint)
  const avatarMetadataAccount = mpl.programs.metadata.Metadata.getPDA(agentMint)
  const [rankingV1Pda, rankingV1Bump] = await getSlaRankingV1Pda(agentMint)
  const [rankingV2Pda, rankingV2Bump] = await getSlaRankingV2Pda(agentMint)
  const [badgeSupplyCounter, badgeSupplyCounterBump] = await getBadgeSupplyCounter()

  // console.log(`creating transaction`)
  const instruction = program.instruction.mintBadgeV2(
    new anchor.BN(treasuryBump),
    new anchor.BN(rankingV1Bump),
    new anchor.BN(rankingV2Bump),
    new anchor.BN(badgeSupplyCounterBump),
    new anchor.BN(badgeToMint.id),
    {
      accounts: {
        mint: badgeMint,
        ata: await ata,
        user: wallet.publicKey,
        treasury: treasuryPda,
        hayMint: HAY_MINT,
        hayUserAta: await hayUserAta,
        hayTreasuryAta: await hayTreasuryAta,
        avatarMint: agentMint,
        avatarToken: await avatarToken,
        avatarMetadata: await avatarMetadataAccount,
        rankingV1: rankingV1Pda,
        rankingV2: rankingV2Pda,
        badgeSupplyCounter,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    }
  )
  const transaction = new anchor.web3.Transaction().add(instruction)

  return await sendTransaction({
    transaction,
    wallet: provider.wallet,
    signers: [],
    connection,
  })
}


export function checkIfBadgeCanBeCombined(
  currentBadge: SlaBadge,
  badgeToCombine: NFT,
): boolean {
  const badgeInfo = SLA_BADGES.filter(b => b.mint === badgeToCombine.mint.toString())[0]
  return (!currentBadge && badgeInfo.id === 2) || (currentBadge && (currentBadge.id === badgeInfo.id - 1))
}