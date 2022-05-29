import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as mpl from "@metaplex/js";

import { findAssociatedTokenAddress } from './utils';
import { COMBINE_AUTHORITY_WALLET, SLA_ARWEAVE_WALLET, SLA_PROGRAM_ID } from '../constants';
import { generateSlaAvatarPda } from './accounts';
import { sendSignedTransaction } from '../transaction';
import * as idl from '../../sla_idl.json';



export async function updateOnChainMetadataAfterCombine(
  avatarMint: PublicKey,
  traitMint: PublicKey,
  wallet: anchor.Wallet,
  connection: anchor.web3.Connection,
  new_uri: string,
): Promise<string> {

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, wallet, {
    preflightCommitment: 'processed',
  })
  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const avatarMetadataAccount = mpl.programs.metadata.Metadata.getPDA(avatarMint)
  const traitMetadataAccount = mpl.programs.metadata.Metadata.getPDA(traitMint)

  const avatarTokenAccount = findAssociatedTokenAddress(wallet.publicKey, avatarMint)
  const traitTokenAccount = findAssociatedTokenAddress(wallet.publicKey, traitMint)

  const [avatarPda, avatarBump] = await generateSlaAvatarPda(avatarMint)

  try {
    const beforeAccount = await program.account.avatarAccount.fetch(avatarPda)
    console.log('Account Before merge: ', beforeAccount)
  } catch (error: any) {
    console.log('Could not fetch avatar PDA account before transaction. Probably doesnt exist yet')
  }

  // Send the transaction
  const instruction = await program.instruction.merge(
    avatarBump,
    new_uri,
    {
      accounts:
      {
        avatar: avatarPda,
        avatarMint: avatarMint,
        traitMint: traitMint,
        avatarToken: await avatarTokenAccount,
        traitToken: await traitTokenAccount,
        avatarMetadata: await avatarMetadataAccount,
        traitMetadata: await traitMetadataAccount,
        payer: wallet.publicKey,
        combineAuthority: COMBINE_AUTHORITY_WALLET,
        arweaveWallet: SLA_ARWEAVE_WALLET,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: mpl.programs.metadata.MetadataProgram.PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    }
  )
  let transaction = new anchor.web3.Transaction({ feePayer: wallet.publicKey }).add(instruction)
  transaction.recentBlockhash = (await connection.getRecentBlockhash('max')).blockhash

  // Serialize transaction to be send to the backend
  console.log('serializing transaction')
  const jsonTransaction = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  }).toJSON()

  // Get the Combine Authority to sign the transaction
  const response = await (await fetch("/api/combineTraits/signCombineInstruction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transaction: JSON.stringify(jsonTransaction),
    })
  })).json()

  // Reconstruct transaction + sign 
  const txData = JSON.parse(response.tx).data
  let transactionFromJson = anchor.web3.Transaction.from(txData)

  // Get the user to sign the transaction 
  console.log('signing using user wallet')
  console.log('fee payer', transaction.feePayer)
  transactionFromJson = await wallet.signTransaction(transactionFromJson)

  console.log('sending transaction')
  const tx = await sendSignedTransaction({ signedTransaction: transactionFromJson, connection })

  const afterAccount = await program.account.avatarAccount.fetch(avatarPda)
  console.log('Account after merge: ', afterAccount)

  return tx
}