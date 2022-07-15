import { PublicKey } from "@solana/web3.js"
import { programs, MetadataJson } from "@metaplex/js"
import { useEffect, useState } from "react"
import { getSlaNFTsByOwner } from "../utils/nfts"
import { SLA_TOKEN_TYPE } from "../utils/constants"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"

export type NFT = {
  pubkey?: PublicKey
  mint: PublicKey
  onchainMetadata: programs.metadata.MetadataData
  externalMetadata: MetadataJson
  type?: SLA_TOKEN_TYPE
}

const useWalletNFTs = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [agentWalletNFTs, setAgentWalletNFTs] = useState<Array<NFT>>([])
  const [traitWalletNFTs, setTraitWalletNFTs] = useState<Array<NFT>>([])
  const [idCardWalletNFTs, setIdCardWalletNFTs] = useState<Array<NFT>>([])

  const fetchNFTs = async () => {
    if (!publicKey) {
      setAgentWalletNFTs([])
      setTraitWalletNFTs([])
      setIdCardWalletNFTs([])
      return
    }

    const nfts = await getSlaNFTsByOwner(publicKey, connection)
    setAgentWalletNFTs(nfts.agents)

    const traits = nfts.clothing.concat(nfts.eyes, nfts.hats, nfts.mouths, nfts.skins)
    setTraitWalletNFTs(traits)

    setIdCardWalletNFTs(nfts.idCards)
  }

  useEffect(() => {
    fetchNFTs()
  }, [publicKey])

  return { agentWalletNFTs, traitWalletNFTs, fetchNFTs, idCardWalletNFTs }
}

export default useWalletNFTs
