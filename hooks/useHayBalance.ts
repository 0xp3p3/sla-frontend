import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { HAY_MINT } from "../utils/constants"
import { findAssociatedTokenAddress } from "../utils/token"

const useBalances = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [solBalance, setSolBalance] = useState<number>(0)
  const [hayBalance, setHayBalance] = useState<number>(0)

  // Fetch SOL balance
  const fetchSolBalance = async () => {
    if (!publicKey) { return 0 } 

    let balance = 0
    try {
      balance = await connection.getBalance(publicKey) / LAMPORTS_PER_SOL
      console.log(`[balance hook] SOL: ${balance}`)
    } catch (error: any) {
      console.log(`[balance hook] unable to fetch SOL balance`)
      console.log(error)
    }

    return balance
  }

  useEffect(() => {
    fetchSolBalance().then(balance => setSolBalance(balance))
  }, [publicKey])

  // Fetch $HAY balance
  const fetchHayBalance = async () => {
    if (!publicKey) { return 0 }

    let balance = 0
    try {
      const account = await findAssociatedTokenAddress(publicKey, HAY_MINT)
      balance = parseInt((await connection.getTokenAccountBalance(account)).value.amount)
      console.log(`[balance hook] $HAY: ${balance}`)
    } catch (error: any) {
      console.log(`[balance hook] unable to fetch $HAY balance`)
      console.log(error)
    }

    return balance
  }

  // Fetch $HAY balance
  useEffect(() => {
    fetchHayBalance().then(balance => setHayBalance(balance))
  }, [publicKey])

  return { solBalance, hayBalance }
}

export default useBalances