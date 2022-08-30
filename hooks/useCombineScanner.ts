import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import * as anchor from "@project-serum/anchor"
import * as mpl from "@metaplex/js"
import useWalletNFTs, { NFT } from "./useWalletNFTs"
import { sendSignedTransaction } from '../utils/transaction';

const dev = process.env.VERCEL_ENV === "development"
const SERVER = dev ? "http://localhost:3000" : "https://secretllamaagency.com"
console.clear()
console.log({SERVER})
export enum CombineScannerStatus {
  WalletNoConnected = "Wallet not connected",
  NoScannerInWallet = "Wallet does not contain a Scanner",
  NothingSelected = "Nothing selected",
  ReadyToCombine = "Ready to combine",
  ScanningAgent = "Scanning and updating Agent",
  AwaitingUserSignature = "Awaiting user signature",
  UpdatingOnChainMetadata = "Updating on-chain metadata",
  ScanningFailed = "Scanning failed",
  ScanningSuccess = "Scanning success",
}

const useCombineScanner = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { scannerWalletNFTs } = useWalletNFTs()

  const [selectedAgent, setSelectedAgent] = useState<NFT>(null)

  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(null)

  const [status, setStatus] = useState<CombineScannerStatus>(CombineScannerStatus.WalletNoConnected)
  const [isCombining, setIsCombining] = useState(false)

  // Log every change of status
  useEffect(() => {
    console.log(`[useCombineScanner hook] setting status to ${status}`)
  }, [status])


  // Log every time the image url changes
  useEffect(() => {
    console.log(`[useCombineScanner hook] new preview url: ${previewImageUrl}`)
  }, [previewImageUrl])


  // Check whether the wallet has an ID card
  useEffect(() => {
    if (scannerWalletNFTs.length === 0) {
      setStatus(CombineScannerStatus.NoScannerInWallet)
    } else {
      setStatus(CombineScannerStatus.NothingSelected)
    }
  }, [scannerWalletNFTs])


  useEffect(() => {
    if (!wallet.publicKey) {
      setStatus(CombineScannerStatus.WalletNoConnected)
    } else if (!scannerWalletNFTs || scannerWalletNFTs.length === 0) {
      setStatus(CombineScannerStatus.NoScannerInWallet)
    } else {
      refreshMetadataToDisplay()
    }
  }, [wallet.publicKey, scannerWalletNFTs])


  // Update the combination of Llama & Trait every time the user selects a different combination
  useEffect(() => {
    console.log('[useCombineScanner hook] refreshing metadata to display')
    refreshMetadataToDisplay()
  }, [selectedAgent, scannerWalletNFTs])

  const refreshMetadataToDisplay = async () => {
    console.log('[refreshMetadataToDisplay hook] refreshing metadata to display')
    if (!wallet.publicKey || scannerWalletNFTs.length === 0) { return }

    try {
      setIsPreviewLoading(true)

      let metadata: mpl.MetadataJson = null
      let newStatus = CombineScannerStatus.NothingSelected
      let url: string = null

      if (selectedAgent) {
        metadata = selectedAgent.externalMetadata
        url = metadata.image
        newStatus = CombineScannerStatus.ReadyToCombine
      }

      setMetadataToDisplay(metadata)
      console.log({ metadata: metadata, url: url, newStatus: newStatus })
      setPreviewImageUrl(url)
      setStatus(newStatus)

    } catch (error: any) {
      console.log(error)
    } finally {
      setIsPreviewLoading(false)
    }
  }


  const scanAgent = async () => {
    console.log(`Scanning agent...`)
    setIsCombining(true)
    setStatus(CombineScannerStatus.ScanningAgent)

    try {
      console.log(`[userCombineScanner hook] creating the on-chain transaction`)
      const data = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadataJson: selectedAgent.externalMetadata,
          mint: selectedAgent.mint.toString(),
          owner: wallet.publicKey.toString(),
        })
      }
      const response = await (await fetch(`${SERVER}/api/scan/scanAgent`, data)).json()
      setStatus(CombineScannerStatus.AwaitingUserSignature)

      if (response.error) {
        throw Error(response.error)
      }

      console.log(`[userCombinerScanner hook] awaiting user signature`)
      const txData = JSON.parse(response.transaction).data
      let transactionFromJson = anchor.web3.Transaction.from(txData)
      transactionFromJson = await wallet.signTransaction(transactionFromJson)

      console.log(`[userCombineScanner hook] sending transaction`)
      setStatus(CombineScannerStatus.UpdatingOnChainMetadata)
      const tx = await sendSignedTransaction({ signedTransaction: transactionFromJson, connection })

      setStatus(CombineScannerStatus.ScanningSuccess)
    } catch (error: any) {
      console.log(error)
      setStatus(CombineScannerStatus.ScanningFailed)
    } finally {
      setIsCombining(false)
    }
  }

  const resetStatus = async () => {
    setIsCombining(false)
    await refreshMetadataToDisplay()
  }

  return {
    status,
    setStatus,
    isCombining,
    resetStatus,
    selectedAgent,
    setSelectedAgent,
    isPreviewLoading,
    metadataToDisplay,
    previewImageUrl,
    setPreviewImageUrl,
    scanAgent,
  }
}

export default useCombineScanner
