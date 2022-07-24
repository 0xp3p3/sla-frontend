import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useAnchorWallet from "./useAnchorWallet"
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

import { getSlaRankingPda } from "../utils/sla/accounts";
import { BadgeAccount, badgeAccountToBadgeInfo, getBadgeAccount } from "../utils/sla/badge";
import { SlaBadge, SLA_BRONZE_BADGE, SLA_DIAMOND_BADGE, SLA_GOLD_BADGE, SLA_PLATINUM_BADGE, SLA_SILVER_BADGE } from "../utils/constants";
import { fetchBadgeSupply } from "../utils/sla/badgeSupply";



export interface CurrentBadgeInfo {
  currentBadgeAccount: BadgeAccount | null,
  currentBadge: SlaBadge | null,
  bronzeSupply: number,
  silverSupply: number,
  goldSupply: number,
  platinumSupply: number,
  diamondSupply: number
  fetchCurrentBadgeSupplies: () => void,
}


const useBadge = (llamaMint: PublicKey | null): CurrentBadgeInfo => {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { anchorWallet } = useAnchorWallet()

  const [currentBadge, setCurrentBadge] = useState<SlaBadge | null>(null)
  const [currentBadgeAccount, setCurrentBadgeAccount] = useState<any | null>(null)

  const [bronzeSupply, setBronzeSupply] = useState<number>(null)
  const [silverSupply, setSilverSupply] = useState<number>(null)
  const [goldSupply, setGoldSupply] = useState<number>(null)
  const [platinumSupply, setPlatinumSupply] = useState<number>(null)
  const [diamondSupply, setDiamondSupply] = useState<number>(null)

  const fetchRanking = async () => {
    if (!publicKey || !llamaMint) {
      setCurrentBadge(null)
      setCurrentBadgeAccount(null)
      return
    }

    const [rankingPda] = await getSlaRankingPda(llamaMint)
    const badgeAccount = await getBadgeAccount(anchorWallet, connection, rankingPda)

    if (!badgeAccount) {
      console.log(`[useBadge hook] no badge found for ${llamaMint.toString()}`)
      setCurrentBadge(null) 
      setCurrentBadgeAccount(null)
    } else {
      
      setCurrentBadgeAccount(badgeAccount)
      console.log(`[useBadge hook] badge account:`, badgeAccount)
      
      const badge = badgeAccountToBadgeInfo(badgeAccount)
      console.log(`[useBadge hook] setting badge to ${badge ? badge.name: null}`)
      setCurrentBadge(badge)
    }
  }

  useEffect(() => {
    fetchRanking()
  }, [publicKey, llamaMint])


  const fetchCurrentBadgeSupplies = async () => {
    if (!connection) { return }

    const supplies = await fetchBadgeSupply(anchorWallet, connection)

    setBronzeSupply(SLA_BRONZE_BADGE.supply - supplies?.bronze)
    setSilverSupply(SLA_SILVER_BADGE.supply - supplies?.silver)
    setGoldSupply(SLA_GOLD_BADGE.supply - supplies?.gold)
    setPlatinumSupply(SLA_PLATINUM_BADGE.supply - supplies?.platinum)
    setDiamondSupply(SLA_DIAMOND_BADGE.supply - supplies?.diamond)
  }

  useEffect(() => {
    fetchCurrentBadgeSupplies()
  }, [publicKey])

  
  return { 
    currentBadgeAccount, 
    currentBadge,
    bronzeSupply, 
    silverSupply,
    goldSupply,
    platinumSupply,
    diamondSupply,
    fetchCurrentBadgeSupplies,
  }
}

export default useBadge