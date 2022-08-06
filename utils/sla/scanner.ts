import * as anchor from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor"
import { 
  TOKEN_PROGRAM_ID, 
  SLA_PROGRAM_ID, 
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, 
  HAY_MINT, 
  SCANNER_MINT,
  SLA_HAY_TREASURY_WALLET,
} from "../constants";
import { getSlaTreasuryPda } from "./accounts";
import { sendTransaction } from "../transaction";

import idl from '../../sla_idl.json'
import { findAssociatedTokenAddress } from "./utils";


export async function mintScanner(
  wallet: Wallet,
  connection: anchor.web3.Connection,
): Promise<string> {

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: 'processed',
  })

  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const [treasuryPda, treasuryBump] = await getSlaTreasuryPda()
  const ata = findAssociatedTokenAddress(wallet.publicKey, SCANNER_MINT)
  const hayUserAta = findAssociatedTokenAddress(wallet.publicKey, HAY_MINT)
  const hayTreasuryAta = findAssociatedTokenAddress(SLA_HAY_TREASURY_WALLET, HAY_MINT)

  const instruction = program.instruction.mintScanner(
    treasuryBump,
    {
      accounts: {
        mint: SCANNER_MINT,
        ata: await ata,
        user: wallet.publicKey,
        treasury: treasuryPda,
        hayMint: HAY_MINT,
        hayUserAta: await hayUserAta,
        hayTreasuryAta: await hayTreasuryAta,
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