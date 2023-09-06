import * as anchor from "@coral-xyz/anchor";
import { PublicKey, ParsedTransaction } from '@solana/web3.js';

export interface CheckMergeIsAllowedAccounts {
  readonly avatarPda: PublicKey,
  readonly avatarMint: PublicKey,
  readonly traitMint: PublicKey,
  readonly avatarTokenPda: PublicKey,
  readonly traitTokenPda: PublicKey,
  readonly user: PublicKey,
  readonly systemProgram: PublicKey,
  readonly slaProgram: PublicKey,
}

export async function unpackCheckMergeIsAllowedTransaction(
  tx: string,
  connection: anchor.web3.Connection
): Promise<CheckMergeIsAllowedAccounts> {

  // Unpack the transaction and extract all accounts involved
  const transactionData = await connection.getParsedConfirmedTransaction(tx)
  const accounts = parseCheckMergeIsAllowedTransaction(transactionData.transaction)
  
  return accounts
}

function parseCheckMergeIsAllowedTransaction(
  transaction: ParsedTransaction
): CheckMergeIsAllowedAccounts {
  const accounts = transaction.message.accountKeys
  const [
    user,
    avatarPda,
    avatarMint,
    traitMint,
    avatarTokenPda,
    traitTokenPda,
    systemProgram,
    slaProgram,
   ] = accounts.map(a => a.pubkey)

   return {
    avatarPda,
    avatarMint,
    traitMint,
    avatarTokenPda,
    traitTokenPda,
    user,
    systemProgram,
    slaProgram
   }
}