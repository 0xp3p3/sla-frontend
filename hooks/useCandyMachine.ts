import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Wallet } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useMemo, useState } from "react"
import { CandyMachineAccount, getCandyMachineState, mintOneToken } from "../utils/candy-machine"
import { awaitTransactionSignatureConfirmation } from "../utils/transaction"
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

export enum MintingStatus {
  NotMinting,
  PreparingTransaction,
  SendingTransaction,
  RequestingConfirmation,
  WaitingConfirmation,
  Success,
  Failure,
}


const useCandyMachine = (collection: SlaCollection, balance: number) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const id = new PublicKey(collection.candyMachine)

  const countdown = useCountdown()
  const [cm, setCm] = useState<CandyMachineAccount>(null)
  
  const [isMinting, setIsMinting] = useState(false)
  const [preMintingStatus, setPreMintingStatus] = useState<PreMintingStatus>(PreMintingStatus.WalletNotConnected)
  const [mintingStatus, setMintingStatus] = useState<MintingStatus>(MintingStatus.NotMinting)

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

  const onMint = async (): Promise<PublicKey | null> => {
    if (!canUserMint()) {
      console.log(`[cm hook] user cannot mint`)
    }

    let newMint: PublicKey | null = null
    try {
      console.log(`[cm hook] starting to mint from ${id.toString()}`)
      
      setIsMinting(true)
      setMintingStatus(MintingStatus.PreparingTransaction)
      const txPromise = mintOneToken(
        cm,
        new PublicKey(collection.collection),
        wallet.publicKey,
        [],
        []
      )[0]

      setMintingStatus(MintingStatus.SendingTransaction)
      const tx = await txPromise
      console.log(`[cm hook] minting txs: `, tx)

      // console.log(`[cm hook] awaiting minting transaction confirmation`)
      // setMintingStatus(MintingStatus.RequestingConfirmation)
      // const statusPromise = awaitTransactionSignatureConfirmation(
      //   tx, DEFAULT_TIMEOUT, connection,
      // )

      // setMintingStatus(MintingStatus.WaitingConfirmation)
      // const status = await statusPromise
      // console.log(`[cm hook] minting tx status:`, status)

      // if (status && !status.err) {
      //   setMintingStatus(MintingStatus.Success)
      //   console.log(`[cm hook] minting success!`)
      // }

      // newMint = new PublicKey("")
    } catch (error: any) {
      setMintingStatus(MintingStatus.Failure)
      console.log(`[cm hook] minting failed`)
      console.log(error)
    } finally {
      setIsMinting(false)
    }

    refreshState()

    return newMint
  }

  return {
    cm, isMinting, refreshState, canUserMint, onMint, preMintingStatus, mintingStatus
  }
}

export default useCandyMachine