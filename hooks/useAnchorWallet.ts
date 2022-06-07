import { useWallet } from "@solana/wallet-adapter-react"
import { useMemo } from "react"
import { Wallet } from "@project-serum/anchor"


const useAnchorWallet = () => {
  const wallet = useWallet()

  const anchorWallet = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
      return
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as Wallet
  }, [wallet])

  return { anchorWallet }
}

export default useAnchorWallet