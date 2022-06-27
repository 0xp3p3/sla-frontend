import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Wallet } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useMemo, useState } from "react"
import { CandyMachineAccount, getCandyMachineState, mintOneToken } from "../utils/candy-machine"
import { awaitTransactionSignatureConfirmation } from "../utils/transaction"
import { SlaCollection, DEFAULT_TIMEOUT } from "../utils/constants"
import { findAssociatedTokenAddress } from "../utils/token"


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


export interface CandyMachine {
  cm: CandyMachineAccount,
  isMinting: boolean,
  refreshState: () => Promise<void>,
  canUserMint: () => boolean,
  onMint: () => Promise<PublicKey | null>,
  preMintingStatus: PreMintingStatus,
  mintingStatus: MintingStatus,
  isUserWhitelisted: boolean,
  discountPrice: number,
}


const useCandyMachine = (collection: SlaCollection, balance: number): CandyMachine => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const id = new PublicKey(collection.candyMachine)

  const [cm, setCm] = useState<CandyMachineAccount>(null)
  
  const [isMinting, setIsMinting] = useState(false)
  const [preMintingStatus, setPreMintingStatus] = useState<PreMintingStatus>(PreMintingStatus.WalletNotConnected)
  const [mintingStatus, setMintingStatus] = useState<MintingStatus>(MintingStatus.NotMinting)

  const [isUserWhitelisted, setIsUserWhitelisted] = useState(false)
  const [discountPrice, setDiscountPrice] = useState(null)

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
      await checkWhitelistStatus(cndy)
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

  const checkWhitelistStatus = async (cm: CandyMachineAccount) => {
    let whitelistPrice = null
    let userIsWhitelisted = false

    console.log(`[cm hook] checking whitelist status`)

    // The whitelist is on if the settings are not null and it's a "presale"
    if (wallet?.publicKey && cm?.state.whitelistMintSettings?.presale) {
      
      // Is there a discount?
      whitelistPrice = cm.state.price
      if (cm.state.whitelistMintSettings.discountPrice) {
        whitelistPrice = cm.state.whitelistMintSettings.discountPrice
      } 

      // Is the user whitelisted?
      const whitelistMint = new PublicKey(cm.state.whitelistMintSettings.mint)
      const [token] = await findAssociatedTokenAddress(wallet.publicKey, whitelistMint)

      // Check if the user has a whitelist token
      try {
        const balance = await connection.getTokenAccountBalance(token)
        userIsWhitelisted = parseInt(balance.value.amount) > 0
      } catch(error: any) {
        console.log(`[cm hook] unable to fetch whitelist token balance`)
        console.log(error)
      }
    }

    console.log(`[cm hook] whitelisted? ${userIsWhitelisted}, discount price: ${whitelistPrice}`)
    setDiscountPrice(whitelistPrice)
    setIsUserWhitelisted(userIsWhitelisted)
  }

  useEffect(() => {
    if (cm) {
      console.log(`isActive`, cm.state.isActive)
    }
    if (!wallet || !wallet.publicKey) {
      setPreMintingStatus(PreMintingStatus.WalletNotConnected)
    } else if (!cm || !cm.state) {
      setPreMintingStatus(PreMintingStatus.CmStateNotFetched)
    } 
    // else if (!cm.state.isActive) {
    //   setPreMintingStatus(PreMintingStatus.NotLiveYet)
    // } 
    
     // = user is not whitelisted + doesn't have enough for non-whitelist 
    else if (((!discountPrice || !isUserWhitelisted) && (balance < cm.state.price))) {
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
    isUserWhitelisted,
    discountPrice,
  }
}

export default useCandyMachine