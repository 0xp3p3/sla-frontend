import { NextApiRequest, NextApiResponse } from "next";
import * as mpl from '@metaplex/js';
import axios from "axios";
import { estimateManifestSize, fetchCostToStore } from "../../../utils/mainnetUpload";


export default async (req: NextApiRequest, res: NextApiResponse) => {

  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
  }

  const body = req.body
  const imageUrl: string = body.imageUrl
  const metadataJson: mpl.MetadataJson = body.metadataJson

  try {
    // Download image from url
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data, "utf-8")

    // Calculate cost of uploading files to Arweave
    const storageCost = await fetchCostToStore([
      imageBuffer.length,
      JSON.stringify(metadataJson).length,
      estimateManifestSize(['0.png', 'metadata.json']),
    ])


    res.status(200).send({ cost: Math.ceil(storageCost) })
    return

  } catch (error: any) {
    console.log('Could not estimate arweave upload cost', error)
    res.status(500).send({ error: 'Could not estimate arweave upload cost' })
  }
}