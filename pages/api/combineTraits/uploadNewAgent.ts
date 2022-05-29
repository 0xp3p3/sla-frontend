import { NextApiRequest, NextApiResponse } from "next";
import * as mpl from '@metaplex/js';
import axios from "axios";
import { uploadToArweave } from "../../../utils/mainnetUpload";


export default async (req: NextApiRequest, res: NextApiResponse) => {
  
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
  }

  const body = req.body
  const imageUrl: string = body.imageUrl
  const metadataJson: mpl.MetadataJson = body.metadataJson
  const tx: string = body.tx  

  // Download image from url
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
  const imageBuffer = Buffer.from(response.data, "utf-8")

  // Upload to arweave
  try {
    const uploadResult = await uploadToArweave(imageBuffer, metadataJson, tx)
    console.log('sending link results back to client')
    res.status(200).send( uploadResult )

  } catch (error: any) {
    console.log('Could not upload new assets to arweave', error)
    res.status(500).send( { error: 'Could not upload new assets to arweave' })
  } 
}