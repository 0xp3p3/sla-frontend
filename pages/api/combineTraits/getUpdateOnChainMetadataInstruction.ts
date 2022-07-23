import { NextApiRequest, NextApiResponse } from "next";
import * as anchor from "@project-serum/anchor";
import axios from "axios";
import { getNFTMetadata } from "../../../utils/nfts";
import { createNewAvatarMetadata } from "../../../utils/metadata";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import * as mpl from "@metaplex/js"
import { findAssociatedTokenAddress } from "../../../utils/sla/utils";
import { generateSlaAvatarPda, getSlaRankingPda } from "../../../utils/sla/accounts";
import { COMBINE_AUTHORITY_WALLET, SLA_ARWEAVE_WALLET, TOKEN_PROGRAM_ID, SLA_PROGRAM_ID, ID_CARD_MINT } from "../../../utils/constants";
import idl from '../../../sla_idl.json'


export default async (req: NextApiRequest, res: NextApiResponse) => {

  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
  }

  const body = req.body

  try {

    // Load the combine authority keypair
    const keypair = anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.COMBINE_AUTHORITY_SECRET))
    )

    console.log(body)

    // Create transaction + check that the new metadata is correct
    let transaction: anchor.web3.Transaction
    if (body.newName) {
      console.log('creating ChangeAlias transaction')
      transaction = await createChangeAliasTransaction(
        new PublicKey(body.agentMint),
        new PublicKey(body.owner),
        body.newUri,
        body.newName,
        keypair,
      )
    } else {
      if (body.badgeAssetId) {
        console.log(`creating Badgecombine transaction`)
        transaction = await createBadgecombineTransaction(
          new PublicKey(body.agentMint),
          new PublicKey(body.traitMint),
          body.badgeAssetId,
          new PublicKey(body.owner),
          body.newUri,
          keypair,
        )
      } else {
        console.log(`creating TraitCombine transaction`)
        transaction = await createTraitCombineTransaction(
          new PublicKey(body.agentMint),
          new PublicKey(body.traitMint),
          new PublicKey(body.owner),
          body.newUri,
          keypair,
        )
      }
    }

    // Serialize transaction
    console.log('re-serializing transaction')
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toJSON()

    console.log('sending response')
    res.status(200).send({ tx: JSON.stringify(serializedTransaction) })

  } catch (error: any) {
    console.log(error)
    res.status(500).send({ error: 'Combine Authority could not sign transaction' })
  }
}


async function createTraitCombineTransaction(
  agentMint: PublicKey,
  traitMint: PublicKey,
  owner: PublicKey,
  newUri: string,
  updateAuthority: Keypair,
): Promise<Transaction> {

  // Initialize a connection to the blockchain
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT
  const connection = new anchor.web3.Connection(endpoint)

  // Before doing anything else, check that the new metadata file is as-expected
  if (!validateMerge(owner, agentMint, traitMint, newUri, connection)) {
    throw Error('Requested combination is invalid.')
  }

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, new anchor.Wallet(updateAuthority), {
    preflightCommitment: 'processed',
  })
  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const avatarMetadataAccount = mpl.programs.metadata.Metadata.getPDA(agentMint)
  const traitMetadataAccount = mpl.programs.metadata.Metadata.getPDA(traitMint)

  const avatarTokenAccount = findAssociatedTokenAddress(owner, agentMint)
  const traitTokenAccount = findAssociatedTokenAddress(owner, traitMint)

  const [agentPda, agentBump] = await generateSlaAvatarPda(agentMint)

  try {
    const beforeAccount = await program.account.avatarAccount.fetch(agentPda)
    console.log('Account Before merge: ', beforeAccount)
  } catch (error: any) {
    console.log('Could not fetch avatar PDA account before transaction. Probably doesnt exist yet')
  }

  // Create the transaction
  const instruction = await program.instruction.merge(
    agentBump,
    newUri,
    {
      accounts:
      {
        avatar: agentPda,
        avatarMint: agentMint,
        traitMint: traitMint,
        avatarToken: await avatarTokenAccount,
        traitToken: await traitTokenAccount,
        avatarMetadata: await avatarMetadataAccount,
        traitMetadata: await traitMetadataAccount,
        payer: owner,
        combineAuthority: COMBINE_AUTHORITY_WALLET,
        arweaveWallet: SLA_ARWEAVE_WALLET,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: mpl.programs.metadata.MetadataProgram.PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    }
  )
  let transaction = new anchor.web3.Transaction({ feePayer: owner }).add(instruction)
  transaction.recentBlockhash = (await connection.getRecentBlockhash('max')).blockhash

  // Sign transaction with the update authority
  console.log('Signing transaction with combine authority')
  transaction.partialSign(updateAuthority)

  return transaction
}



async function createChangeAliasTransaction(
  agentMint: PublicKey,
  owner: PublicKey,
  newUri: string,
  newName: string,
  updateAuthority: Keypair,
): Promise<Transaction> {

  // Initialize a connection to the blockchain
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT
  const connection = new anchor.web3.Connection(endpoint)

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, new anchor.Wallet(updateAuthority), {
    preflightCommitment: 'processed',
  })
  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const avatarMetadataAccount = mpl.programs.metadata.Metadata.getPDA(agentMint)
  const avatarTokenAccount = findAssociatedTokenAddress(owner, agentMint)

  const idCardAta = findAssociatedTokenAddress(owner, ID_CARD_MINT)

  // Create the transaction
  const instruction = await program.instruction.changeAlias(
    newUri,
    newName,
    {
      accounts:
      {
        avatarMint: agentMint,
        avatarToken: await avatarTokenAccount,
        avatarMetadata: await avatarMetadataAccount,
        idCardMint: ID_CARD_MINT,
        idCardAta: await idCardAta,
        payer: owner,
        combineAuthority: COMBINE_AUTHORITY_WALLET,
        arweaveWallet: SLA_ARWEAVE_WALLET,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: mpl.programs.metadata.MetadataProgram.PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    }
  )
  let transaction = new anchor.web3.Transaction({ feePayer: owner }).add(instruction)
  transaction.recentBlockhash = (await connection.getRecentBlockhash('max')).blockhash

  // Sign transaction with the update authority
  console.log('Signing transaction with combine authority')
  transaction.partialSign(updateAuthority)

  return transaction
}


async function createBadgecombineTransaction(
  agentMint: PublicKey,
  badgeMint: PublicKey,
  badgeAssetId: number,
  owner: PublicKey,
  newUri: string,
  updateAuthority: Keypair,
): Promise<Transaction> {

  // Initialize a connection to the blockchain
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT
  const connection = new anchor.web3.Connection(endpoint)

  // Before doing anything else, check that the new metadata file is as-expected
  if (!validateMerge(owner, agentMint, badgeMint, newUri, connection)) {
    throw Error('Requested combination is invalid.')
  }

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, new anchor.Wallet(updateAuthority), {
    preflightCommitment: 'processed',
  })
  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const avatarTokenAccount = findAssociatedTokenAddress(owner, agentMint)
  const avatarMetadataAccount = mpl.programs.metadata.Metadata.getPDA(agentMint)

  const badgeTokenAccount = findAssociatedTokenAddress(owner, badgeMint)
  const [rankingPda, rankingBump] = await getSlaRankingPda(agentMint)

  try {
    const beforeAccount = await program.account.avatarAccount.fetch(rankingPda)
    console.log('Account Before merge: ', beforeAccount)
  } catch (error: any) {
    console.log('Could not fetch avatar PDA account before transaction. Probably doesnt exist yet')
  }

  // Create the transaction
  const instruction = await program.instruction.mergeBadge(
    rankingBump,
    badgeAssetId,
    newUri,
    {
      accounts:
      {
        avatarMint: agentMint,
        avatarToken: await avatarTokenAccount,
        avatarMetadata: await avatarMetadataAccount,
        payer: owner,
        badgeMint: badgeMint,
        badgeAta: await badgeTokenAccount,
        ranking: rankingPda,
        combineAuthority: COMBINE_AUTHORITY_WALLET,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: mpl.programs.metadata.MetadataProgram.PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    }
  )
  let transaction = new anchor.web3.Transaction({ feePayer: owner }).add(instruction)
  transaction.recentBlockhash = (await connection.getRecentBlockhash('max')).blockhash

  // Sign transaction with the update authority
  console.log('Signing transaction with combine authority')
  transaction.partialSign(updateAuthority)

  return transaction

}


async function validateMerge(
  user: PublicKey,
  agentMint: PublicKey,
  traitMint: PublicKey,
  newUri: string,
  connection: Connection,
): Promise<boolean> {

  // Fetch the metadata of the agent and the trait
  const agentNft = await getNFTMetadata(agentMint.toString(), connection)
  const traitNft = await getNFTMetadata(traitMint.toString(), connection)
  console.log('fetched old metadata')

  // Fetch the new agent metadata
  const newMetadata: mpl.MetadataJson = (await axios.get(newUri)).data
  console.log('fetched new metadata from uri')

  // Re-create the expected new metadata
  let expectedMetadata = createNewAvatarMetadata(agentNft.externalMetadata, traitNft.externalMetadata)

  // Assume that the image URI is correct in the new metadata (should have been checked upstream)
  expectedMetadata.image = newMetadata.image
  expectedMetadata.properties.files[0].uri = newMetadata.properties.files[0].uri

  console.log('checking metadata is as-expected')
  const newMetadataString = JSON.stringify(newMetadata)
  const expectedMetadataString = JSON.stringify(expectedMetadata)
  if (newMetadata === expectedMetadata) {
    console.log(`Expected and actual metadata don't match`)
    console.log(newMetadataString)
    console.log(expectedMetadataString)
    return false
  }

  return true
}
