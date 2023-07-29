import { useWallet } from "@solana/wallet-adapter-react"
import { useMemo } from "react"


const useAnchorWallet = () => {
  const wallet = useWallet()

  const anchorWallet = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
      return
    }

    return wallet
  }, [wallet])

  return { anchorWallet }
}

export default useAnchorWallet