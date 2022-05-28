import { NextApiRequest, NextApiResponse } from "next";
import * as mpl from '@metaplex/js';
import axios from "axios";
import { uploadToArweave } from "../../../utils/mainnetUpload";
import { web3 } from "@project-serum/anchor";


export default async (req: NextApiRequest, res: NextApiResponse) => {
  
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
  }

  const body = req.body
  const imageUrl: string = body.imageUrl
  const metadataJson: mpl.MetadataJson = body.metadataJson 

  // Download image from url
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
  const imageBuffer = Buffer.from(response.data, "utf-8")

  // Load keypair to sign the upload transaction
  const key = process.env.ARWEAVE_UPLOADER_SECRET_KEY
  const keypair = web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(key)))

  // Initialize connection to the blockchain
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT
  const connection = new web3.Connection(endpoint)

  // Upload to arweave
  try {
    console.log('Calling function to upload to arweave')
    const uploadResult = await uploadToArweave(imageBuffer, metadataJson, keypair, connection)
    console.log('Upload result')
    console.log(uploadResult)

    res.status(200).send( { uploadResult: uploadResult })

  } catch (error: any) {
    console.log('Could not upload new assets to arweave')
    console.log(error)

    res.status(500).send( { error: 'Could not upload new assets to arweave' })
  } 
}