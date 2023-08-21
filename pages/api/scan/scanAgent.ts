import { NextApiRequest, NextApiResponse } from "next";
import * as anchor from "@project-serum/anchor";
import * as mpl from '@metaplex/js';
import { sendUploadFund, UploadResult } from "../../../utils/mainnetUpload";
import { findAssociatedTokenAddress } from "../../../utils/sla/utils";
import idl from '../../../sla_idl.json'
import { COMBINE_AUTHORITY_WALLET, SCANNER_MINT, TOKEN_PROGRAM_ID, SLA_PROGRAM_ID } from "../../../utils/constants";
import { Provider } from "@project-serum/anchor";
import {NodeBundlr} from "@bundlr-network/client";


const dev = process.env.VERCEL_ENV === "development"
const SERVER = dev ? "http://localhost:3000" : "https://sla-frontend.vercel.app"
// "https://secretllamaagency.com"


export default async (req: NextApiRequest, res: NextApiResponse) => {

  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
  }

  const IMPOSTERS = JSON.parse(process.env.IMPOSTER_MINTS)

  const body = req.body
  let metadataJson: mpl.MetadataJson = body.metadataJson
  const mint: string = body.mint
  const owner: string = body.owner

  console.log(`Scanning mint ${mint}`)

  let isImposter = false
  let transaction = null

  try {
    // Initialize a connection to the blockchain
    const connection = getConnection()
    const wallet = getWallet()

    // Upload new metadata and image to Arweave if neeeded
    let newMetadataUri: string | null = null
    isImposter = IMPOSTERS.includes(mint)

    if (isImposter) {
      console.log(`mint ${mint} is an imposter!`)
      metadataJson = addImposterTraits(metadataJson)

    } else {
      console.log(`mint ${mint} is not an imposter`)
      metadataJson = addScannedTrait(metadataJson)

    }

    const s3Url = await pushNewImageToS3(metadataJson)
    // newMetadataUri = await uploadToArweave(metadataJson, s3Url, connection, wallet)

    const bundlrProvider = new Provider(connection, getKeypair().secretKey, {
      preflightCommitment: "processed",
      commitment: "processed",
    });

    // const Bundlr = (await import("@bundlr-network/client")).WebBundlr;

    const bundlr = new NodeBundlr("https://node1.bundlr.network", 'solana', bundlrProvider.wallet, { providerUrl: process.env.NEXT_PUBLIC_SOLANA_ENDPOINT });
        
    await bundlr.ready()

    const newImageUrl = s3Url
        
    const newMetadata = JSON.stringify(metadataJson).replaceAll("0.png", newImageUrl)
    const priceAtomic = await bundlr.getPrice(newMetadata.length);
    await bundlr.fund(priceAtomic);
    const manifestId = await bundlr.upload(newMetadata, {tags: [{name: "content-type", value: "application/json"}]});
    newMetadataUri = `https://arweave.net/${manifestId.id}/`;

    res.status(200).send({ transaction: JSON.stringify(newMetadataUri) })

    // Update the metadata URI if needed + burn the Scanner
    transaction = await createChainInstruction(mint, newMetadataUri, connection, getKeypair(), owner)


  } catch (error: any) {
    console.log('Could not scan agent', error)
    res.status(500).send({ error: 'Could not scan agent' })
    return
  }

  if (!transaction) {
    res.status(500).send({ error: 'The transaction could not be created' })
    return
  }

  res.status(200).send({ transaction: JSON.stringify(transaction) })
}


function getConnection(): anchor.web3.Connection {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT
  return new anchor.web3.Connection(endpoint)
}


function getKeypair(): anchor.web3.Keypair {
  // Load the combine authority keypair
  return anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.COMBINE_AUTHORITY_SECRET))
  )
}


function getWallet(): anchor.Wallet {
  return new anchor.Wallet(getKeypair())
}

// Alter NFT meta if Llama is Imposter
function addImposterTraits(metadata: mpl.MetadataJson): mpl.MetadataJson {
  for (const trait_type of ["Ears", "Vignette"]) {
    metadata.attributes.push({
      "trait_type": trait_type, "value": "Alpaca"
    })
  }

  metadata.image = '0.png'
  metadata.properties.files[0].uri = '0.png'

  return metadata
}
// Alter NFT metadata to include scanned property
function addScannedTrait(metadata: mpl.MetadataJson): mpl.MetadataJson {
  const update = [...metadata.attributes, { trait_type: "Verified Agent", value: "True" }]
  metadata.attributes = update

  metadata.image = '0.png'
  metadata.properties.files[0].uri = '0.png'

  return metadata
}


async function pushNewImageToS3(metadata: mpl.MetadataJson): Promise<string> {
  console.log(`Uploading new image to S3`)
  const data = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ attributes: metadata.attributes })
  }
  const response = await fetch(`${SERVER}/api/combineTraits/createNewAgent`, data)
  const responseBody = await response.json()
  console.log(`New S3 image url: ${responseBody.url}`)

  return responseBody.url
}


async function uploadToArweave(
  metadata: mpl.MetadataJson,
  s3ImageUrl: string,
  connection: anchor.web3.Connection,
  wallet: any,
): Promise<string> {

  try {
    // Fetch cost of uploading files to arweave
    console.log(`Fetching Arweave upload cost`)
    const data = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: s3ImageUrl,
        metadataJson: JSON.stringify(metadata),
      })
    }
    const response = await (await fetch(`${SERVER}/api/combineTraits/arweaveUploadCost`, data)).json()

    if (response.error) {
      throw Error('Unable to fetch Arweave upload cost')
    }

    const uploadCost = response.cost

    // Request the user to pay the cost
    console.log(`Sending upload fund`)
    const tx = await sendUploadFund(
      uploadCost,
      connection,
      wallet,
      () => { },
    )

    // Upload files to arweave
    const dataUpload = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageUrl: s3ImageUrl,
        metadataJson: metadata,
        tx: tx,
      })
    }
    console.log(`Uploading new metadata and image to Arweave`)
    // console.log({ metadata: metadata })
    const responseUpload = await (await fetch(`${SERVER}/api/combineTraits/uploadNewAgent`, dataUpload)).json()
    const arweaveUploadResult: UploadResult = responseUpload
    console.log('New arweave metadata uri', arweaveUploadResult.metadataUrl)

    if (arweaveUploadResult.error) {
      throw Error(arweaveUploadResult.error)
    }
    return arweaveUploadResult.metadataUrl

  } catch (error: any) {
    console.log(error)
  }
  return null
}


async function createChainInstruction(
  mint: string,
  newMetadataUri: string | null,
  connection: anchor.web3.Connection,
  updateAuthority: anchor.web3.Keypair,
  user: string,
): Promise<any> {

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, new anchor.Wallet(updateAuthority), {
    preflightCommitment: 'processed',
  })
  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const mintKey = new anchor.web3.PublicKey(mint)
  const userKey = new anchor.web3.PublicKey(user)

  const avatarMetadataAccount = mpl.programs.metadata.Metadata.getPDA(mintKey)
  const avatarTokenAccount = findAssociatedTokenAddress(userKey, mintKey)
  const scannerAta = findAssociatedTokenAddress(userKey, SCANNER_MINT)

  // Create the transaction
  const instruction = await program.instruction.scanAgent(
    newMetadataUri,
    {
      accounts:
      {
        avatarMint: mintKey,
        avatarToken: await avatarTokenAccount,
        avatarMetadata: await avatarMetadataAccount,
        scannerMint: SCANNER_MINT,
        scannerAta: await scannerAta,
        user: user,
        combineAuthority: COMBINE_AUTHORITY_WALLET,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: mpl.programs.metadata.MetadataProgram.PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    }
  )
  let transaction = new anchor.web3.Transaction({ feePayer: updateAuthority.publicKey }).add(instruction)
  transaction.recentBlockhash = (await connection.getRecentBlockhash('max')).blockhash

  // Sign transaction with the update authority
  console.log('Signing transaction with combine authority')
  transaction.partialSign(updateAuthority)

  // Serialize transaction
  console.log('serializing transaction')
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  }).toJSON()

  return serializedTransaction
}