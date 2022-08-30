import * as path from 'path';
import * as anchor from '@project-serum/anchor';
import web3 from '@solana/web3.js'
import { calculate } from '@metaplex/arweave-cost';
import { ARWEAVE_PAYMENT_WALLET, ARWEAVE_UPLOAD_ENDPOINT } from './constants';
import FormData from 'form-data';
import fetch from 'node-fetch';
import * as mpl from '@metaplex/js';
import { sendTransactions } from "./transaction";


export interface UploadResult {
  metadataUrl: string,
  imageUrl: string,
  error?: string,
}


export async function uploadToArweave(
  imageBuffer: Buffer,
  metadata: mpl.MetadataJson,
  tx: string,
): Promise<UploadResult> {

  // Create the data to send to Arweave
  const data = new FormData()
  data.append('transaction', tx)
  data.append('env', 'mainnet-beta')
  data.append('file[]', imageBuffer, {
    filename: '0.png',
    contentType: 'image/png',
  })
  data.append('file[]', Buffer.from(JSON.stringify(metadata)), 'metadata.json')

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
    }

  } else {
    throw new Error(`No transaction ID for upload of new assets`)
  }
  return
}

export function estimateManifestSize(filenames: string[]): number {
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

export async function fetchCostToStore(fileSizes: number[]) {
  const result = await calculate(fileSizes);
  console.clear()
  console.log({ fileSizes })
  // It shouldn't be x100 here, but it doesn't work otherwise
  return result.solana * anchor.web3.LAMPORTS_PER_SOL * 100;
}

export async function sendUploadFund(
  storageCost: number,
  connection: web3.Connection,
  wallet: any,
  transactionsSignedCallback?: () => void,
): Promise<string> {
  const instructions = [
    anchor.web3.SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: ARWEAVE_PAYMENT_WALLET,
      lamports: storageCost,
    }),
  ]

  // Sign transaction, broadcast, and confirm
  const { txs } = await sendTransactions(
    connection,
    wallet,
    [instructions],
    [[]],
    'singleGossip',
    [],
    [],
    transactionsSignedCallback,
  )

  return txs[0]
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