import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor"
import * as mpl from "@metaplex/js"

import { HAY_MINT, SlaBadge, SLA_BADGES, SLA_HAY_TREASURY_WALLET, SLA_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID } from "../constants";
import idl from '../../sla_idl.json'
import { getBadgeSupplyCounter, getSlaRankingV1Pda, getSlaTreasuryPda } from "./accounts";
import { findAssociatedTokenAddress } from "./utils";
import { sendTransaction } from "../transaction";
import { NFT } from "../../hooks/useWalletNFTs";


export interface BadgeAccountV1 {
  ranking: any,
  mintedNext: boolean,
}


export async function getBadgeAccountV1(
  wallet: Wallet,
  connection: anchor.web3.Connection,
  rankingPda: anchor.web3.PublicKey,
): Promise<any> {

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: 'processed',
  })

  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  try {
    const ranking = await program.account.ranking.fetch(rankingPda)
    console.log(`\n\n ${ranking} \n\n\n`)
    return ranking
  } catch (error: any) {
    console.log(error)
    return null
  }
}


export function badgeAccountV1ToBadgeInfo(badgeAccount: BadgeAccountV1): SlaBadge | null {

  if (!badgeAccount || !badgeAccount.ranking) { return null }

  console.log(`badge account V1 \n\n`)
  console.log(badgeAccount)

  // The Rust Enum has fields following the pattern "badgeBronze"
  const filtered = SLA_BADGES.filter(b => `badge${b.name}` in badgeAccount.ranking)

  if (filtered.length > 0) {
    return filtered[0]
  } else {
    return null
  }
}


export async function mintBadgeV1(
  wallet: Wallet,
  connection: anchor.web3.Connection,
  badgeToMint: SlaBadge,
  agentMint: anchor.web3.PublicKey,
): Promise<string> {

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, wallet, {
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
  const [rankingPda, rankingBump] = await getSlaRankingV1Pda(agentMint)
  const [badgeSupplyCounter, badgeSupplyCounterBump] = await getBadgeSupplyCounter()

  console.log(`Badge to mint:`)
  console.log(badgeToMint)

  console.log(`creating transaction`)
  const instruction = program.instruction.mintBadge(
    new anchor.BN(treasuryBump),
    new anchor.BN(rankingBump),
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
        ranking: rankingPda,
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


export function checkIfBadgeCanBeCombinedV1(
  currentBadge: SlaBadge,
  badgeToCombine: NFT,
): boolean {
  const badgeInfo = SLA_BADGES.filter(b => b.mint === badgeToCombine.mint.toString())[0]
  console.log('badge info: ', badgeInfo)
  console.log('current badge: ', currentBadge)
  return (!currentBadge && badgeInfo.id === 2) || (currentBadge && (currentBadge.id === badgeInfo.id - 1))
}