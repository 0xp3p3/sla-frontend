import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useAnchorWallet from "./useAnchorWallet"
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

import { getSlaRankingPda } from "../utils/sla/accounts";
import { BadgeAccount, getBadgeAccount } from "../utils/sla/badge";
import { SlaBadge, SLA_BADGES, SLA_BRONZE_BADGE, SLA_DIAMOND_BADGE, SLA_GOLD_BADGE, SLA_PLATINUM_BADGE, SLA_SILVER_BADGE } from "../utils/constants";



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

      const matchingBadge = SLA_BADGES.filter(b => b.id === badgeAccount.ranking)
      if (matchingBadge.length === 0) {
        console.log(`[useBadge hook] rank in PDA does not match any badge`)
        setCurrentBadge(null)
      } else {
        console.log(`[useBadge hook] setting badge to ${matchingBadge[0].name}`)
        setCurrentBadge(matchingBadge[0])
      }
    }
  }

  useEffect(() => {
    fetchRanking()
  }, [publicKey, llamaMint])


  const fetchCurrentBadgeSupplies = async () => {
    if (!connection) { return }

    const fetchSupplyForSingleBadge = async (mint: string, maxSupply: number): Promise<number>  => {
      const supply = (await connection.getTokenSupply(new PublicKey(mint))).value
      return Math.max(0, maxSupply - parseInt(supply.amount))
    }

    setBronzeSupply(await fetchSupplyForSingleBadge(SLA_BRONZE_BADGE.mint, SLA_BRONZE_BADGE.supply))
    setSilverSupply(await fetchSupplyForSingleBadge(SLA_SILVER_BADGE.mint, SLA_SILVER_BADGE.supply))
    setGoldSupply(await fetchSupplyForSingleBadge(SLA_GOLD_BADGE.mint, SLA_GOLD_BADGE.supply))
    setPlatinumSupply(await fetchSupplyForSingleBadge(SLA_PLATINUM_BADGE.mint, SLA_PLATINUM_BADGE.supply))
    setDiamondSupply(await fetchSupplyForSingleBadge(SLA_DIAMOND_BADGE.mint, SLA_DIAMOND_BADGE.supply))
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