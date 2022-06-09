import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Wallet } from "@project-serum/anchor"
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useEffect, useMemo, useState } from "react"
import { CandyMachineAccount, getCandyMachineState, mintOneToken } from "../utils/candy-machine"
import { awaitTransactionSignatureConfirmation } from "../utils/transaction"
import { SlaCollection, DEFAULT_TIMEOUT } from "../utils/constants"
import useCountdown from "./useCountdown"


export enum PreMintingStatus {
  WalletNotConnected = "Wallet not connected",
  CmStateNotFetched = "CM not fetched",
  BalanceTooSmall = "Balance too small",
  NotLiveYet = "Not live yet",
  Ready = "Ready",
}

export enum MintingStatus {
  NotMinting = "Not minting",
  WaitingForUserConfirmation = "Waiting for Agent's signature",
  SendingTransaction = "Sending transaction",
  WaitingConfirmation = "Waiting transaction confirmation",
  Success = "Success",
  Failure = "Failed",
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
    if (!wallet) {
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
    } else if (balance < cm.state.price) {
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

      setMintingStatus(MintingStatus.WaitingForUserConfirmation)
      console.log(`[cm hook] setting mintingStatus to ${MintingStatus.WaitingForUserConfirmation}`)

      const { txs, mint } = await mintOneToken(
        cm,
        new PublicKey(collection.collection),
        wallet.publicKey,
        [],
        [],
        () => setMintingStatus(MintingStatus.SendingTransaction)
      )

      const tx = txs[0]
      console.log(`[cm hook] minting txs: `, tx)

      setMintingStatus(MintingStatus.WaitingConfirmation)
      console.log(`[cm hook] setting mintingStatus to ${MintingStatus.WaitingConfirmation}`)

      const status = await awaitTransactionSignatureConfirmation(
        tx, DEFAULT_TIMEOUT, connection,
      )

      if (status && !status.err) {
        setMintingStatus(MintingStatus.Success)
        console.log(`[cm hook] setting mintingStatus to ${MintingStatus.Success}`)
      } else {
        setMintingStatus(MintingStatus.Failure)
        console.log(`[cm hook] setting mintingStatus to ${MintingStatus.Failure}`)
      }

      newMint = mint;
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
    cm, 
    isMinting, 
    refreshState, 
    canUserMint, 
    onMint, 
    preMintingStatus, 
    mintingStatus,
  }
}

export default useCandyMachine