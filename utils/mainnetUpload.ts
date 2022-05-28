import * as path from 'path';
import * as anchor from '@project-serum/anchor';
import web3 from '@solana/web3.js'
import { calculate } from '@metaplex/arweave-cost';
import { ARWEAVE_PAYMENT_WALLET, ARWEAVE_UPLOAD_ENDPOINT } from './constants';
import FormData from 'form-data';
import fetch from 'node-fetch';
import * as mpl from '@metaplex/js';


interface UploadResult {
  metadataUrl: string,
  imageUrl: string,
  storageCost: number,
}


export async function uploadToArweave(
  image: Buffer,
  metadata: mpl.MetadataJson,
  arweaveWalletKeypair: web3.Keypair,
  connection: web3.Connection,
): Promise<UploadResult> {

  // Metadata string 
  const metadataString = JSON.stringify(metadata)

  // Calculate cost of uploading files to Arweave
  const storageCost = await fetchCostToStore([
    image.length,
    metadataString.length,
    estimateManifestSize(['0.png', 'metadata.json']),
  ])

  // Transfer upload funds to Metaplex Arweave wallet
  console.log('Sending upload funds')
  const tx = await sendUploadFund(arweaveWalletKeypair, storageCost, connection)

  // Create the data to send to Arweave
  const data = new FormData()
  data.append('transaction', tx)
  data.append('env', 'mainnet-beta')
  data.append('file[]', image, {
    filename: '0.png',
    contentType: 'image/png',
  })
  data.append('file[]', metadata.toString(), 'metadata.json')
  console.log('final metadata to send')
  console.log(metadata)

  // Upload data to Arweave
  const result = await upload(data)

  // Check upload was successful and extract the new Arweave links
  const uploadedMetadataFile = result.messages?.find(
    m => m.filename === 'manifest.json',
  )
  const uploadedImageFile = result.messages?.find(
    m => m.filename === `0.png`,
  )

  if (uploadedMetadataFile?.transactionId) {
    const link = `https://arweave.net/${uploadedMetadataFile.transactionId}`
    const imageLink = `https://arweave.net/${uploadedImageFile.transactionId}?ext=png`
    console.log(`File uploaded: ${link}`)

    return {
      metadataUrl: link,
      imageUrl: imageLink,
      storageCost: storageCost
    }
  
  } else {
    throw new Error(`No transaction ID for upload of new assets`)
  }
  return
}

function estimateManifestSize(filenames: string[]): number {
  const paths = {};

  for (const name of filenames) {
    paths[name] = {
      id: 'artestaC_testsEaEmAGFtestEGtestmMGmgMGAV438',
      ext: path.extname(name).replace('.', ''),
    }
  }

  const manifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    paths,
    index: {
      path: 'metadata.json',
    },
  }

  const data = Buffer.from(JSON.stringify(manifest), 'utf8')
  return data.length
}

async function fetchCostToStore(fileSizes: number[]) {
  const result = await calculate(fileSizes);

  // It shouldn't be x100 here, but it doesn't work otherwise
  return result.solana * anchor.web3.LAMPORTS_PER_SOL * 100;
}

async function sendUploadFund(
  walletKeypair: web3.Keypair, 
  storageCost: number,
  connection: web3.Connection,
): Promise<string> {
  const transaction = new anchor.web3.Transaction().add(
    anchor.web3.SystemProgram.transfer({
      fromPubkey: walletKeypair.publicKey,
      toPubkey: ARWEAVE_PAYMENT_WALLET,
      lamports: storageCost,
    }),
  )

  // Sign transaction, broadcast, and confirm
  const tx = await anchor.web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [walletKeypair],
  )

  return tx
}

async function upload(data: FormData): Promise<any> {
  return await (
    await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
      method: 'POST',
      // @ts-ignore
      body: data,
    })
  ).json();
}