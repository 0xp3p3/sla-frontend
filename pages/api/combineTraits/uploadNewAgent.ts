import { NextApiRequest, NextApiResponse } from "next";
import * as mpl from '@metaplex/js';
import axios from "axios";
import { uploadToArweave, UploadResult } from "../../../utils/mainnetUpload";
import { sleep } from "../../../utils/utils";


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
    
    // Upload new files to Arweave
    const uploadResult = await uploadToArweave(imageBuffer, metadataJson, tx)

    // Check whether image URI in updloaded metadata matches the image uploaded to Arweave
    await checkSuccessArweaveUpload(uploadResult)

    console.log('sending link results back to client')
    res.status(200).send( uploadResult )

  } catch (error: any) {
    console.log('Could not upload new assets to arweave', error)
    res.status(500).send( { error: 'Could not upload new assets to arweave' })
  } 
}



const checkSuccessArweaveUpload = async (uploadResult: UploadResult): Promise<void> => {
  const { imageUrl, metadataUrl } = uploadResult

  if (!imageUrl) { throw Error(`imageUrl is ${imageUrl}`) }
  if (!metadataUrl) { throw Error(`metadataUrl is ${metadataUrl}`) }

  // Fetch content of metadata file (allow 10 tries)
  let i = 0
  let imageUriInMetadata: string
  console.log(`[checking new uri] image uri received from upload: ${imageUrl}`)
  while (i < 10 && !imageUriInMetadata) {
    const metadata = (await axios.get(metadataUrl)).data
    imageUriInMetadata = metadata.image
    console.log(`[checking new uri] image uri in metadata: ${imageUriInMetadata}`)
    
    sleep(6000)
    i += 1
  }

  if (removeUrlPrefix(imageUriInMetadata) !== removeUrlPrefix(imageUrl)) {
    throw Error(`image uri received from Arweave upload (${imageUrl}) is not the same as the one in the metadata (${imageUriInMetadata})`)
  }

  console.log(`[checking new uril] image uri from upload and from metadata match - all good.`)
}


// Remove the "http://", "https://", or "www." from the beginning of a URL
const removeUrlPrefix = (url: string): string => {
  const noHttp = url.replace(/^https?:\/\//, '')
  const result = noHttp.replace(/^www./, '')
  return result
}
