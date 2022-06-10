import { Connection, PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import axios from "axios"
import { programs } from "@metaplex/js"

import { NFT } from "../hooks/useWalletNFTs"
import { AGENT_COLLECTION, SLA_COLLECTIONS, TRAIT_COLLECTIONS } from "./constants"
import { String } from "aws-sdk/clients/batch"

const {
  metadata: { Metadata },
} = programs


interface SlaNFTs {
  agents: NFT[],
  clothing: NFT[],
  eyes: NFT[],
  hats: NFT[],
  mouths: NFT[],
  skins: NFT[],
}


export async function getNFTMetadata(
  mint: string,
  conn: Connection,
  pubkey?: string
): Promise<NFT | undefined> {
  try {
    const metadataPDA = await Metadata.getPDA(mint)
    const onchainMetadata = (await Metadata.load(conn, metadataPDA)).data
    const externalMetadata = (await axios.get(onchainMetadata.data.uri)).data

    return {
      pubkey: pubkey ? new PublicKey(pubkey) : undefined,
      mint: new PublicKey(mint),
      onchainMetadata,
      externalMetadata,
    }
  } catch (e) {
    console.log(`failed to pull metadata for token ${mint}`)
  }
}

export async function getNFTMetadataForMany(
  tokens: any[],
  conn: Connection
): Promise<NFT[]> {
  const promises: Promise<NFT | undefined>[] = []
  tokens.forEach((token) =>
    promises.push(getNFTMetadata(token.mint, conn, token.pubkey))
  )
  const nfts = (await Promise.all(promises)).filter((n) => !!n)

  return nfts
}

export async function getNFTsByOwner(
  owner: PublicKey,
  conn: Connection
): Promise<NFT[]> {
  const tokenAccounts = await conn.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  })

  const tokens = tokenAccounts.value
    .filter((tokenAccount) => {
      const amount = tokenAccount.account.data.parsed.info.tokenAmount

      return amount.decimals === 0 && amount.uiAmount === 1
    })
    .map((tokenAccount) => {
      return {
        pubkey: tokenAccount.pubkey,
        mint: tokenAccount.account.data.parsed.info.mint,
      }
    })

  return await getNFTMetadataForMany(tokens, conn)
}

export async function getSlaNFTsByOwner(
  owner: PublicKey,
  connection: Connection
): Promise<SlaNFTs> {

  const nfts = await getNFTsByOwner(owner, connection)

  return {
    agents: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.agent.collection),
    clothing: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.clothing.collection),
    eyes: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.eyes.collection),
    hats: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.hat.collection),
    mouths: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.mouth.collection),
    skins: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.skin.collection)
  }
}

export function filterNFTsFromCollection(
  nfts: NFT[],
  collection: string,
): NFT[] {

  return nfts.filter(nft => {
    const onChainCollection = nft.onchainMetadata.collection
    if (!onChainCollection) { return false }
    return (onChainCollection.key === collection && onChainCollection.verified)
  })
}