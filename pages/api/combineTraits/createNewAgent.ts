import { NextApiRequest, NextApiResponse } from "next";
import S3 from 'aws-sdk/clients/s3';
import aws from 'aws-sdk';
import * as mpl from '@metaplex/js';
import { createNewAvatar } from "../../../utils/image";
import { getS3ImageUrl } from "../../../utils/s3";


export default async (req: NextApiRequest, res: NextApiResponse) => {

  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
  }

  const body = req.body
  const attributes: mpl.MetadataJsonAttribute[] = body.attributes

  // Extract environment variables
  const missing = missingEnvs()
  if (missing.length > 0) {
    res
      .status(500)
      .json({ error: `Next S3 Upload: Missing ENVs ${missing.join(', ')}` })
  } else {

    // S3 config
    const region = process.env.S3_UPLOAD_REGION
    // console.log(region);
    const config = {
      accessKeyId: process.env.S3_UPLOAD_KEY,
      secretAccessKey: process.env.S3_UPLOAD_SECRET,
      region: region,
    }
    const bucket = process.env.S3_UPLOAD_BUCKET

    // Generate the filename to use based on the Llama's attributes
    const { url, key } = getS3ImageUrl(attributes, region, bucket)

    // Simply return the url if the image already exists in the bucket
    const response = await fetch(url)
    if (response.status === 200) {
      console.log(`Image already present in s3, simply returning url`)
      res.status(200).json({
        url: url,
      })
      return;
    }

    // Create new image to upload
    let imageBuffer: Buffer;
    try {
      imageBuffer = await createNewAvatar(attributes)
    } catch (error: any) {
      console.log(error)
      res.status(500).json({ error: 'Unable to create new image buffer' })
      return
    }

    let policy = {
      Statement: [
        {
          Sid: 'Stmt1S3UploadAssets',
          Effect: 'Allow',
          Action: ['s3:PutObject'],
          Resource: [`arn:aws:s3:::${bucket}/${key}`],
        },
      ],
    };

    let sts = new aws.STS(config);

    let token = await sts
      .getFederationToken({
        Name: 'S3UploadWebToken',
        Policy: JSON.stringify(policy),
        DurationSeconds: 60 * 60, // 1 hour
      })
      .promise();

    const s3 = new S3({
      accessKeyId: token.Credentials.AccessKeyId,
      secretAccessKey: token.Credentials.SecretAccessKey,
      sessionToken: token.Credentials.SessionToken,
      region: process.env.S3_UPLOAD_REGION,
    })

    const params = {
      Bucket: bucket,
      Key: key,
      Body: imageBuffer,
      CacheControl: 'max-age=630720000, public',
      ContentType: "image/png",
    }

    const s3Upload = s3.upload(params)

    const uploadResult = await s3Upload.promise()

    res.status(200).json({
      url: uploadResult.Location,
    })
  }
}


// This code checks the for missing env vars that this
// API route needs.
//
// Why does this code look like this? See this issue!
// https://github.com/ryanto/next-s3-upload/issues/50
//
let missingEnvs = (): string[] => {
  let keys = [];
  if (!process.env.S3_UPLOAD_KEY) {
    keys.push('S3_UPLOAD_KEY');
  }
  if (!process.env.S3_UPLOAD_SECRET) {
    keys.push('S3_UPLOAD_SECRET');
  }
  if (!process.env.S3_UPLOAD_REGION) {
    keys.push('S3_UPLOAD_REGION');
  }
  if (!process.env.S3_UPLOAD_BUCKET) {
    keys.push('S3_UPLOAD_BUCKET');
  }
  return keys;
};
