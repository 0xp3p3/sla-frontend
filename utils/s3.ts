import * as mpl from '@metaplex/js';
import { sortAttributes } from './utils';
import * as CryptoJs from "crypto-js"


// Construct the S3 url at which to store this llama, based on its attributes
export function getS3ImageUrl(
  attributes: mpl.MetadataJsonAttribute[] | null,
  region: string,
  bucket: string,
): {url: string, key: string} {

  // Construct the filename used as key in the bucket
  const sortedAttributes = sortAttributes(attributes)
  const attributeValues = sortedAttributes.map(value => value.value)
  const filename = attributeValues.join('-')

  // Make the url
  const encryptedFilename = encryptString(filename)
  const key = `agents/${encryptedFilename}.png`
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

  return { url: url, key: key }
} 

// Encrypt the S3 filename so that it's not simply the attribute names
function encryptString(key: string): string {
  return CryptoJs.enc.Base64.stringify(CryptoJs.enc.Utf8.parse(key))
}
