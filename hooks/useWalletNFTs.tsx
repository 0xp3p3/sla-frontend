import { PublicKey } from "@solana/web3.js"
import { programs } from "@metaplex/js"
import { useEffect, useState } from "react"
import { getNFTsByOwner } from "../utils/staking/nfts"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"

export type NFT = {
  pubkey?: PublicKey
  mint: PublicKey
  onchainMetadata: programs.metadata.MetadataData
  externalMetadata: {
    attributes: Array<any>
    collection: any
    description: string
    edition: number
    external_url: string
    image: string
    name: string
    properties: {
      files: Array<string>
      category: string
      creators: Array<string>
    }
    seller_fee_basis_points: number
  }
}

const useWalletNFTs = () => {
  const AGENT_COLLECTION = process.env.NEXT_PUBLIC_COLLECTION_AVATAR
  console.log(`agent collection: ${AGENT_COLLECTION}`)

  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [walletNFTs, setWalletNFTs] = useState<Array<NFT>>([])
  const [agentWalletNFTs, setAgentWalletNFTs] = useState<Array<NFT>>([])

  useEffect(() => {
    const fetchNFTs = async () => {

      // Fetch all NFTs
      const NFTs = await getNFTsByOwner(publicKey, connection)
      setWalletNFTs(NFTs)
      console.log(`N NFTS: ${NFTs.length}`)
      console.log(NFTs)

      // Filter Llama Agents
      const agentNFTs = walletNFTs.filter(nft => {
        return (nft.onchainMetadata.collection.key === AGENT_COLLECTION && nft.onchainMetadata.collection.verified)
      })
      setAgentWalletNFTs(agentNFTs)
      console.log(`N Agent NFTS: ${agentNFTs.length}`)
    }

    if (publicKey) {
      fetchNFTs()
    }
  }, [publicKey])

  return { walletNFTs, agentWalletNFTs }
}

export default useWalletNFTs
