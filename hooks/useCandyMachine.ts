import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Wallet } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useMemo, useState } from "react"
import { CandyMachineAccount, getCandyMachineState, mintOneToken, awaitTransactionSignatureConfirmation } from "../utils/candy-machine"
import { SlaCollection } from "../utils/constants"
import { DEFAULT_TIMEOUT } from "../utils/_combine/utils/constants"
import useCountdown from "./useCountdown"


export enum PreMintingStatus {
  WalletNotConnected,
  CmStateNotFetched,
  BalanceTooSmall,
  NotLiveYet,
  Ready,
}


const useCandyMachine = (collection: SlaCollection, balance: number) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const id = new PublicKey(collection.candyMachine)

  const countdown = useCountdown()
  const [cm, setCm] = useState<CandyMachineAccount>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [preMintingStatus, setPreMintingStatus] = useState<PreMintingStatus>(PreMintingStatus.WalletNotConnected)

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

  const refreshState = async () => {
    if (!anchorWallet) {
      if (cm) { cm.state.isActive = false }
      return
    }

    try {
      const cndy = await getCandyMachineState(anchorWallet, id, connection)
      setCm(cndy)
      console.log(`[cm hook] successfully fetched CM state`)
    } catch (error: any) {
      console.log(`[cm hook] failed to fetch CM state`)
      console.log(error)
    }

  }

  useEffect(() => {
    refreshState()
  }, [wallet.publicKey, connection])

  useEffect(() => {
    if (!wallet || !wallet.publicKey) {
      setPreMintingStatus(PreMintingStatus.WalletNotConnected)
    } else if (!cm || !cm.state) {
      setPreMintingStatus(PreMintingStatus.CmStateNotFetched)
    } else if (!cm.state.isActive || !countdown.isLive()) {
      setPreMintingStatus(PreMintingStatus.NotLiveYet)
    } else if (balance < cm.state.price.toNumber()) {
      setPreMintingStatus(PreMintingStatus.BalanceTooSmall)
    } else {
      setPreMintingStatus(PreMintingStatus.Ready)
    }
  }, [wallet.publicKey, cm])

  const canUserMint = () => {
    return preMintingStatus === PreMintingStatus.Ready
  }

  const onMint = async (): Promise<boolean> => {
    if (!canUserMint()) {
      console.log(`[cm hook] user cannot mint`)
    }

    let success = false
    try {
      setIsMinting(true)
      console.log(`[cm hook] starting to mint from ${id.toString()}`)

      const mintOneSignature = await mintOneToken(
        cm,
        new PublicKey(collection.collection),
        wallet.publicKey,
        [],
        []
      )[0]
      console.log(`[cm hook] minting txs: `, mintOneSignature)

      console.log(`[cm hook] awaiting minting transaction confirmation`)
      const status = await awaitTransactionSignatureConfirmation(
        mintOneSignature,
        DEFAULT_TIMEOUT,
        connection,
        true
      )
      console.log(`[cm hook] minting tx status:`, status)

      if (status && !status.err) {
        success = true
        console.log(`[cm hook] minting success!`)
      }

    } catch (error: any) {
      console.log(`[cm hook] minting failed`)
      console.log(error)
    } finally {
      setIsMinting(false)
    }

    refreshState()

    return success
  }

  return {
    cm, isMinting, refreshState, canUserMint, onMint, preMintingStatus
  }
}

export default useCandyMachine