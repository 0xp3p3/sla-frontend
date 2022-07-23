import { Connection, PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"
import axios from "axios"
import { programs } from "@metaplex/js"

import { NFT } from "../hooks/useWalletNFTs"
import { SLA_COLLECTIONS, ID_CARD_MINT, SLA_TOKEN_TYPE, SLA_BRONZE_BADGE, SLA_SILVER_BADGE, SLA_GOLD_BADGE, SLA_PLATINUM_BADGE, SLA_DIAMOND_BADGE } from "./constants"

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
  idCards: NFT[],
  bronzeBadges: NFT[], 
  silverBadges: NFT[],
  goldBadges: NFT[],
  platinumBadges: NFT[],
  diamondBadges: NFT[],
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

      return amount.decimals === 0 && amount.uiAmount >= 1
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
    agents: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.agent.collection, SLA_TOKEN_TYPE.AGENT),
    clothing: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.clothing.collection, SLA_TOKEN_TYPE.TRAIT),
    eyes: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.eyes.collection, SLA_TOKEN_TYPE.TRAIT),
    hats: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.hat.collection, SLA_TOKEN_TYPE.TRAIT),
    mouths: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.mouth.collection, SLA_TOKEN_TYPE.TRAIT),
    skins: filterNFTsFromCollection(nfts, SLA_COLLECTIONS.skin.collection, SLA_TOKEN_TYPE.TRAIT),
    idCards: filterTokensByMint(nfts, ID_CARD_MINT.toString(), SLA_TOKEN_TYPE.ID_CARD),
    bronzeBadges: filterTokensByMint(nfts, SLA_BRONZE_BADGE.mint, SLA_TOKEN_TYPE.BADGE),
    silverBadges: filterTokensByMint(nfts, SLA_SILVER_BADGE.mint, SLA_TOKEN_TYPE.BADGE),
    goldBadges: filterTokensByMint(nfts, SLA_GOLD_BADGE.mint, SLA_TOKEN_TYPE.BADGE),
    platinumBadges: filterTokensByMint(nfts, SLA_PLATINUM_BADGE.mint, SLA_TOKEN_TYPE.BADGE),
    diamondBadges: filterTokensByMint(nfts, SLA_DIAMOND_BADGE.mint, SLA_TOKEN_TYPE.BADGE),
  }
}

export function filterNFTsFromCollection(
  nfts: NFT[],
  collection: string,
  tokenType?: SLA_TOKEN_TYPE,
): NFT[] {

  const filtered = nfts.filter(nft => {
    const onChainCollection = nft.onchainMetadata.collection
    if (!onChainCollection) { return false }
    return (onChainCollection.key === collection && onChainCollection.verified)
  })

  // Add a boolean to mark these NFTs as traits if needed
  filtered.forEach(nft => nft.type = tokenType ? tokenType : null)

  return filtered
}

function filterTokensByMint(
  nfts: NFT[],
  mint: string,
  tokenType?: SLA_TOKEN_TYPE,
): NFT[] {
  const filtered = nfts.filter(nft => nft.mint.toString() === mint)
  filtered.forEach(nft => nft.type = tokenType ? tokenType : null)
  return filtered
}


async function getOnchainMetadataForMint(
  mint: string, 
  connection: Connection
): Promise<programs.metadata.MetadataData> {
    const metadataPDA = await Metadata.getPDA(mint)
    const onchainMetadata = (await Metadata.load(connection, metadataPDA)).data
    return onchainMetadata
}

export async function getOnchainMetadataForMints(
  mintList: string[],
  connection: Connection,
): Promise<programs.metadata.MetadataData[]> {

  const promises: Promise<programs.metadata.MetadataData | undefined>[] = []
  mintList.forEach((mint) =>
    promises.push(getOnchainMetadataForMint(mint, connection))
  )
  const data = (await Promise.all(promises)).filter((n) => !!n)

  return data
}