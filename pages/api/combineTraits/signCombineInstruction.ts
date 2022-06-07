import { NextApiRequest, NextApiResponse } from "next";
import * as anchor from "@project-serum/anchor";
import { programs } from "@metaplex/js"
import axios from "axios";
import { getNFTMetadata } from "../../../utils/nfts";
import { createNewAvatarMetadata } from "../../../utils/metadata";

const { metadata: { Metadata } } = programs


type JsonTransaction = { type: "Buffer", data: number[] }


export default async (req: NextApiRequest, res: NextApiResponse) => {
  
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
  }

  const body = req.body

  try {
    // Re-construct transaction
    const jsonTransaction: JsonTransaction = JSON.parse(body.transaction)
    const transaction = anchor.web3.Transaction.from(jsonTransaction.data)
    
    // Make sure that the new URI has not been maliciously modified
    const avatarMint = transaction.instructions[0].data
    // await validateMetadataBeforeSigning(transaction.instructions[0].data)

    // Sign transaction with the Combine Authority account
    const keypair = anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.COMBINE_AUTHORITY_SECRET))
    )
    console.log('signing transaction')
    transaction.partialSign(keypair)

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
    res.status(500).send( { error: 'Combine Authority could not sign transaction' })
  } 
}


async function validateMetadataBeforeSigning(
  avatarMint: string,
  traitMint: string,
  newUri: string
): Promise<void> {

  // Initialize a connection to the blockchain
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT
  const connection = new anchor.web3.Connection(endpoint)

  // Fetch the old avatar metadata from Arweave
  const avatarMetadata = getNFTMetadata(avatarMint, connection)

  // Fetch the trait metadata from Arweave
  const traitMetadata = getNFTMetadata(traitMint, connection)

  // Reconstruct the expected avatar metadata
  const expectedMetadata = createNewAvatarMetadata(
    (await avatarMetadata).externalMetadata, 
    (await traitMetadata).externalMetadata
  )

  // Fetch the new avatar metadata from Arweave
  const newMetadata = (await axios.get(newUri)).data

  // Check that the expected and actual new avatar metadata match
  if (expectedMetadata !== newMetadata) {
    console.log(`Actual metadata:`, newMetadata)
    console.log(`Expected metadata`, expectedMetadata)
    throw Error(`Metadata from ${newUri} is not as expected`)
  }
}