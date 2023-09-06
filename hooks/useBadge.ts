import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useAnchorWallet from "./useAnchorWallet"
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

import { getSlaRankingV1Pda, getSlaRankingV2Pda } from "../utils/sla/accounts";
import { SlaBadge, SLA_BRONZE_BADGE, SLA_DIAMOND_BADGE, SLA_GOLD_BADGE, SLA_PLATINUM_BADGE, SLA_SILVER_BADGE } from "../utils/constants";
import { fetchBadgeSupply } from "../utils/sla/badgeSupply";
import { BadgeAccountV2, badgeAccountV2ToBadgeInfo, getBadgeAccountV2 } from "../utils/sla/badgeV2";
import { BadgeAccountV1, badgeAccountV1ToBadgeInfo, getBadgeAccountV1 } from "../utils/sla/badgeV1";



export interface CurrentBadgeInfo {
  currentBadgeAccountV1: BadgeAccountV1 | null,
  currentBadgeAccountV2: BadgeAccountV2 | null,
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
  const [currentBadgeAccountV1, setCurrentBadgeAccountV1] = useState<any | null>(null)
  const [currentBadgeAccountV2, setCurrentBadgeAccountV2] = useState<any | null>(null)

  const [bronzeSupply, setBronzeSupply] = useState<number>(null)
  const [silverSupply, setSilverSupply] = useState<number>(null)
  const [goldSupply, setGoldSupply] = useState<number>(null)
  const [platinumSupply, setPlatinumSupply] = useState<number>(null)
  const [diamondSupply, setDiamondSupply] = useState<number>(null)

  const fetchRanking = async () => {
    if (!publicKey || !llamaMint) {
      setCurrentBadge(null)
      setCurrentBadgeAccountV1(null)
      setCurrentBadgeAccountV2(null)
      return
    }

    let badgeFound: SlaBadge | null = null

    // Fetch V2 account
    const [rankingPdaV2] = await getSlaRankingV2Pda(llamaMint)
    const badgeAccountV2 = await getBadgeAccountV2(anchorWallet, connection, rankingPdaV2)

    if (!badgeAccountV2) {
      console.log(`[useBadge hook] no V2 badge found for ${llamaMint.toString()}`)
      setCurrentBadgeAccountV2(null)
    } else {
      setCurrentBadgeAccountV2(badgeAccountV2)
      console.log(`[useBadge hook] badge V2 account:`, badgeAccountV2)
      
      badgeFound = badgeAccountV2ToBadgeInfo(badgeAccountV2)
    }

    // Fetch V1 account 
    const [rankingPdaV1] = await getSlaRankingV1Pda(llamaMint)
    const badgeAccountV1 = await getBadgeAccountV1(anchorWallet, connection, rankingPdaV1)

    if (!badgeAccountV1) {
      console.log(`[useBadge hook] no V1 badge found for ${llamaMint.toString()}`)
      setCurrentBadgeAccountV1(null)
    } else {
      
      setCurrentBadgeAccountV1(badgeAccountV1)
      console.log(`[useBadge hook] badge account:`, badgeAccountV1)
      
      // Only override the V2 badge if it is None
      if (!badgeFound) {
        badgeFound = badgeAccountV1ToBadgeInfo(badgeAccountV1)
      }
    }

    setCurrentBadge(badgeFound)
  }

  useEffect(() => {
    console.log("fetched ranking", publicKey)
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
    if(publicKey)
      fetchCurrentBadgeSupplies()
  }, [publicKey])

  
  return { 
    currentBadgeAccountV1,
    currentBadgeAccountV2, 
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