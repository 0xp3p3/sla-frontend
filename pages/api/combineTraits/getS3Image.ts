import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";


export default async (req: NextApiRequest, res: NextApiResponse) => {
  
  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' })
  }

  const body = req.body
  const imageUrl: string = body.imageUrl

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const imageBuffer = Buffer.from(response.data, "utf-8")
    res.status(200).json({ imageBuffer: imageBuffer })

  } catch (error: any) {
    console.log(error)
    res.status(500).send( { error: 'Could not download image from S3' })
  } 
}