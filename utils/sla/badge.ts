import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor"
import * as mpl from "@metaplex/js"

import { HAY_MINT, SlaBadge, SLA_HAY_TREASURY_WALLET, SLA_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID } from "../constants";
import idl from '../../sla_idl.json'
import { getSlaRankingPda, getSlaTreasuryPda } from "./accounts";
import { findAssociatedTokenAddress } from "./utils";
import { sendTransaction } from "../transaction";


export interface BadgeAccount {
  ranking: number | null,
  mintedNext: boolean,
}


export async function getBadgeAccount(
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
      return ranking
    } catch (error: any) {
      console.log(error)
      return null
    }
}


export function isRequirementMet(currentBadge: SlaBadge | null, requiredBadge: SlaBadge | null): boolean {

  if (!requiredBadge && !currentBadge) { 
    return true 
  } else if (!currentBadge) {
    return false 
  } else if (currentBadge.id === requiredBadge.id - 1) {
    return true 
  } else {
    return false 
  }
}


export async function mintBadge(
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
  const [rankingPda, rankingBump] = await getSlaRankingPda(agentMint)
  
  console.log(`Badge to mint:`)
  console.log(badgeToMint)

  console.log(`creating transaction`)
  const instruction = program.instruction.mintBadge(
    new anchor.BN(treasuryBump),
    rankingBump,
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