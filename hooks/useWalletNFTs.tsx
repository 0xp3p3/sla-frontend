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
  const [badgeWalletNFTs, setBadgeWalletNFTs] = useState<Array<NFT>>([])
  const [scannerWalletNFTs, setScannerWalletNFTs] = useState<Array<NFT>>([])

  const fetchNFTs = async () => {
    if (!publicKey) {
      setAgentWalletNFTs([])
      setTraitWalletNFTs([])
      setIdCardWalletNFTs([])
      setBadgeWalletNFTs([])
      setScannerWalletNFTs([])
      return
    }

    const nfts = await getSlaNFTsByOwner(publicKey, connection)
    // console.log("--------nft lists-----------", nfts)
    setAgentWalletNFTs(nfts.agents)

    const traits = nfts.clothing.concat(nfts.eyes, nfts.hats, nfts.mouths, nfts.skins)
    setTraitWalletNFTs(traits)

    const badges = nfts.bronzeBadges.concat(nfts.silverBadges, nfts.goldBadges, nfts.platinumBadges, nfts.diamondBadges)
    setBadgeWalletNFTs(badges)

    setIdCardWalletNFTs(nfts.idCards)
    setScannerWalletNFTs(nfts.scanners)
  }

  useEffect(() => {
    fetchNFTs()
  }, [publicKey])

  return { agentWalletNFTs, traitWalletNFTs, fetchNFTs, idCardWalletNFTs, badgeWalletNFTs, scannerWalletNFTs }
}

export default useWalletNFTs
