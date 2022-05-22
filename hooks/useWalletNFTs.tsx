import { PublicKey } from "@solana/web3.js"
import { programs, MetadataJson } from "@metaplex/js"
import { useEffect, useState } from "react"
import { getNFTsByOwner } from "../utils/staking/nfts"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { AGENT_COLLECTION, TRAIT_COLLECTIONS } from "../utils/constants"

export type NFT = {
  pubkey?: PublicKey
  mint: PublicKey
  onchainMetadata: programs.metadata.MetadataData
  externalMetadata: MetadataJson
}

const useWalletNFTs = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [walletNFTs, setWalletNFTs] = useState<Array<NFT>>([])
  const [agentWalletNFTs, setAgentWalletNFTs] = useState<Array<NFT>>([])
  const [traitWalletNFTs, setTraitWalletNFTs] = useState<Array<NFT>>([])

  useEffect(() => {
    const fetchNFTs = async () => {

      // Fetch all NFTs
      const NFTs = await getNFTsByOwner(publicKey, connection)
      setWalletNFTs(NFTs)

      // Filter Llama Agents
      const agentNFTs = NFTs.filter(nft => {
        const collection = nft.onchainMetadata.collection
        if (!collection) { return false }
        return (collection.key === AGENT_COLLECTION && collection.verified)
      })
      setAgentWalletNFTs(agentNFTs)

      // Filter Traits
      const traitNFTs = NFTs.filter(nft => {
        const collection = nft.onchainMetadata.collection
        if (!collection) { return false }
        return (TRAIT_COLLECTIONS.includes(collection.key) && collection.verified)
      })
      setTraitWalletNFTs(traitNFTs)
    }

    if (publicKey) {
      fetchNFTs()
    }
  }, [publicKey])

  return { walletNFTs, agentWalletNFTs, traitWalletNFTs }
}

export default useWalletNFTs
