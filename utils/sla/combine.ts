import * as anchor from '@project-serum/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Metadata, MetadataProgram } from '@metaplex-foundation/mpl-token-metadata';

import { findAssociatedTokenAddress, getProvider } from './utils';
import { SLA_ARWEAVE_WALLET } from '../constants';
import { getTraitType } from './traits';
import idl from '../../sla_idl.json';
import solana_config from '../../../sla-config/solana/config.json';
import { generateSlaMasterPda, generateSlaNftPda } from './accounts';
import { requestMerge } from './server';


export async function merge(
  avatarMintKey: PublicKey,
  traitMintKey: PublicKey,
  wallet: AnchorWallet,
  connection: anchor.web3.Connection,
): Promise<string> {

  const provider = await getProvider(connection, wallet)

  // Check whether the merge is allowed or not
  const tx = await checkMergeIsAllowed(
    avatarMintKey,
    traitMintKey,
    wallet,
    provider,
  );

  // Check the transaction was confirmed and issue an error if it hasn't
  const txResult = await connection.confirmTransaction(tx);
  if (txResult.value.err !== null) {
    throw 'Trait cannot be added to Avatar: ' + txResult.value.err.toString()
  }
  
  // Send a request to the server to do it
  console.log("Sending Merge request to server")
  const response = await requestMerge(tx)
  console.log("Server response: ", response)

  // Extract the new metadata Arweave link from the server response
  if (response.error !== null) {
    throw `Could not complete the merge. Error: ${response.error}`
  }
  
  return executeMerge(
    avatarMintKey, 
    traitMintKey, 
    wallet, 
    provider, 
    response.metadataLink!,
    response.uploadPrice!
  )
}


async function checkMergeIsAllowed(
  avatarMint: PublicKey,
  traitMint: PublicKey,
  wallet: AnchorWallet,
  provider: anchor.Provider,
): Promise<string> {

  // Initialize a connection to SLA program
  // @ts-ignore
  const program = new anchor.Program(idl, solana_config.program.id, provider)

  // Get the token account address (PDA from Token program)
  // Generate a PDA and bump for a new account 
  const avatarTokenAccount = findAssociatedTokenAddress(wallet.publicKey, avatarMint)
  const [avatarPda, avatarBump] = await generateSlaNftPda(avatarMint)

  // Get the token account address (PDA from Token program)
  const traitTokenAccount = findAssociatedTokenAddress(wallet.publicKey, traitMint)

  // Get which trait we are trying to merge
  const traitId = await getTraitType(traitMint, provider.connection)

  // Send the transaction
  return program.rpc.checkMergeIsAllowed(
    avatarBump, 
    traitId, 
    { accounts: 
      { 
        avatar: avatarPda,
        avatarMint: avatarMint,
        traitMint: traitMint,
        avatarToken: await avatarTokenAccount,
        traitToken: await traitTokenAccount,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    }
  )
}

async function executeMerge(
  avatarMint: PublicKey,
  traitMint: PublicKey,
  wallet: AnchorWallet,
  provider: anchor.Provider,
  new_uri: string,
  uploadCost: number,
): Promise<string> {

  // Initialize a connection to SLA program
  // @ts-ignore
  const program = new anchor.Program(idl, solana_config.program.id, provider)

  const metadataAccount = Metadata.getPDA(avatarMint)

  const avatarTokenAccount = findAssociatedTokenAddress(wallet.publicKey, avatarMint)
  const traitTokenAccount = findAssociatedTokenAddress(wallet.publicKey, traitMint)
  
  // Get which trait we are trying to merge
  const traitId = await getTraitType(traitMint, provider.connection)

  const [avatarPda, avatarBump] = await generateSlaNftPda(avatarMint)
  const [slaMasterPda, masterBump] = await generateSlaMasterPda()

  const beforeAccount = await program.account.avatarAccount.fetch(avatarPda)
  console.log('Account Before merge: ', beforeAccount)

  // Send the transaction
  const tx = await program.rpc.merge(
    masterBump,
    avatarBump,
    traitId,
    new_uri,
    new anchor.BN(uploadCost),
    { accounts: 
      {
        avatar: avatarPda,
        avatarMint: avatarMint,
        traitMint: traitMint,
        avatarToken: await avatarTokenAccount,
        traitToken: await traitTokenAccount,
        payer: wallet.publicKey,
        avatarMetadata: await metadataAccount,
        slaMasterPda: slaMasterPda,
        arweaveWallet: SLA_ARWEAVE_WALLET,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: MetadataProgram.PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    }
  )

  await provider.connection.confirmTransaction(tx)

  const afterAccount = await program.account.avatarAccount.fetch(avatarPda)
  console.log('Account after merge: ', afterAccount)

  return tx
}