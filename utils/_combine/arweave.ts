import Arweave from 'arweave';
import * as fs from 'fs'

import arweaveWallet from '../../../sla-config/.arweave/arweave-wallet.json'


export interface ArweaveLinks {
  readonly image: string, 
  readonly metadata: string,
}

export async function uploadFilesToArweave(
  imageFilepath: string, 
  metadataFilepath: string,
  config: any,
): Promise<ArweaveLinks> {

  // Initialise a connection with the Arweave network
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  })

  // Load Arweave keypair
  let key = await arweave.wallets.jwkToAddress(arweaveWallet)
  console.log(`Arweave key: ${key}`)

  // Print balance
  const winston = await arweave.wallets.getBalance(key)
  const ar = arweave.ar.winstonToAr(winston)
  console.log(`ar balance: ${ar}`)

  // Upload image
  const image = fs.readFileSync(imageFilepath)
  const imageUri = (await uploadFile(image, arweave, "image/png")) + '?ext=png'

  // Load + update Metadata
  const metadata = JSON.parse(fs.readFileSync(metadataFilepath).toString())
  
  metadata.symbol = config.metadata.symbol
  metadata.image = imageUri
  metadata.properties.files[0].uri = imageUri

  fs.writeFileSync(metadataFilepath, JSON.stringify(metadata))

  // Upload metadata
  const metadataBuffer = Buffer.from(JSON.stringify(metadata))
  const metadataUri = (await uploadFile(metadataBuffer, arweave, "application/json"))

  return {
    image: imageUri,
    metadata: metadataUri
  }
}

async function uploadFile(data: Buffer, arweave: Arweave, contentType: string): Promise<string> {
  // Create image transaction
  let transaction = await arweave.createTransaction(
    // @ts-ignore
      { data: data }, arweaveWallet
    )
    transaction.addTag('Content-Type', contentType);

    // Sign the transaction
    await arweave.transactions.sign(transaction, arweaveWallet)

    // Upload the data
    const uploader = await arweave.transactions.getUploader(transaction)
    while (!uploader.isComplete) {
      await uploader.uploadChunk()
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`)
    }

    // Verify transaction
    const success = await arweave.transactions.verify(transaction)
    console.log(`Transaction success: ${success}`)

    // Print transaction result
    // console.log(transaction)

    // Construct the image URI
    const uri = `https://arweave.net/${transaction.id}`

    return uri
}