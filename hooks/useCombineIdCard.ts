import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import * as mpl from "@metaplex/js"
import useAnchorWallet from "./useAnchorWallet"
import useWalletNFTs, { NFT } from "./useWalletNFTs"
import { sendUploadFund, UploadResult } from "../utils/mainnetUpload"
import { updateOnChainMetadataAfterCombine } from "../utils/sla/combine"
import { ID_CARD_MINT } from "../utils/constants"
import { type WebBundlr } from "@bundlr-network/client";
import { AnchorProvider } from "@coral-xyz/anchor";


export enum CombineIdCardStatus {
  WalletNoConnected = "Wallet not connected",
  NoIdCardInWallet = "Wallet does not contain an ID card",
  NothingSelected = "Nothing selected",
  ReadyToCombine = "Ready to combine",
  AwaitingUserSignatureForArweaveUpload = "Awaiting user signature for arweave upload",
  UploadingToArweave = "Uploading to arweave",
  ArweaveUploadSuccess = "Arweave upload success",
  ArweaveUploadFailed = "Arweave upload failed",
  AwaitingUserSignatureForMetadataUpdate = "Awaiting signature for metadata update",
  UpdatingOnChainMetadata = "Updating on-chain metadata",
  MetadataUpdateSuccess = "On-chain metadata update success",
  MetadataUpdateFailed = "On-chain metadata update failed",
}

const useCombineIdCard = () => {
  const wallet = useWallet()
  const { anchorWallet } = useAnchorWallet()
  const { connection } = useConnection()
  const bundlrProvider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "processed",
    commitment: "processed",
  });
  const { idCardWalletNFTs, fetchNFTs } = useWalletNFTs()

  const [selectedAgent, setSelectedAgent] = useState<NFT>(null)
  const [isVerifiedLlama, setIsVerifiedLlama] = useState(false)

  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(null)
  const [newArweaveMetadataUrl, setNewArweaveMetadataUrl] = useState('')
  const [newArweaveImageUrl, setNewArweaveImageUrl] = useState('')
  const [bundlr, setBundlr] = useState<WebBundlr | undefined>(undefined)

  const [status, setStatus] = useState<CombineIdCardStatus>(CombineIdCardStatus.WalletNoConnected)
  const [isCombining, setIsCombining] = useState(false)

  // Log every change of status
  useEffect(() => {
    console.log(`[useCombineIdCard hook] setting status to ${status}`)
  }, [status])


  // Log every time the image url changes
  useEffect(() => {
    console.log(`[useCombineIdCard hook] new preview url: ${previewImageUrl}`)
  }, [previewImageUrl])

  // Connect Bundlr
  useEffect(() => {
    if( !bundlrProvider.wallet || bundlr) return
    const loadBundlr = async () => {
      const WebBundlr = (await import("@bundlr-network/client")).WebBundlr;

      const bundlr = new WebBundlr("https://node1.bundlr.network", 'solana', bundlrProvider.wallet, { providerUrl: process.env.NEXT_PUBLIC_SOLANA_ENDPOINT });
        
      await bundlr.ready()
      setBundlr(bundlr);
    }

    loadBundlr()
  }, [bundlrProvider.wallet])

  // Check whether the wallet has an ID card
  useEffect(() => {
    if (idCardWalletNFTs.length === 0) {
      setStatus(CombineIdCardStatus.NoIdCardInWallet)
    } else {
      setStatus(CombineIdCardStatus.NothingSelected)
    }
  }, [idCardWalletNFTs])


  useEffect(() => {
    if (!wallet.publicKey) {
      setStatus(CombineIdCardStatus.WalletNoConnected)
    } else if (!idCardWalletNFTs || idCardWalletNFTs.length === 0) {
      // fetchNFTs()
      setStatus(CombineIdCardStatus.NoIdCardInWallet)
    } else {
      refreshMetadataToDisplay()
    }
  }, [wallet.publicKey, idCardWalletNFTs])


  // Update the combination of Llama & Trait every time the user selects a different combination
  useEffect(() => {
    console.log('[useCombineIdCard hook] refreshing metadata to display')
    refreshMetadataToDisplay()
  }, [selectedAgent, idCardWalletNFTs])

  const refreshMetadataToDisplay = async () => {
    if (!wallet.publicKey || idCardWalletNFTs.length === 0) { return }

    try {
      setIsPreviewLoading(true)

      let metadata: mpl.MetadataJson = null
      let newStatus = CombineIdCardStatus.NothingSelected
      let url: string = null

      if (selectedAgent) {
        
        metadata = selectedAgent.externalMetadata
        url = metadata.image
        newStatus = CombineIdCardStatus.ReadyToCombine
      }

      setMetadataToDisplay(metadata)
      setPreviewImageUrl(url)
      setStatus(newStatus)

    } catch (error: any) {
      console.log(error)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  // Combine the Trait with the Llama
  const uploadToArweave = async (newAlias: string) => {
    console.log(`entering function with alias ${newAlias}`)
    setIsCombining(true)

    try {

      // Update the name in the metadata
      console.log(`New alias before uploading: ${newAlias}`)
      if (!newAlias) {
        throw Error(`[useCombineIdCard hook] newAlias is ${newAlias}`)
      }

      let metadata: mpl.MetadataJson = JSON.parse(JSON.stringify(metadataToDisplay))
      metadata.name = newAlias
      metadata.image = previewImageUrl
      metadata.properties.files[0].uri = previewImageUrl

      // setStatus(CombineIdCardStatus.AwaitingUserSignatureForArweaveUpload)

      // // Fetch cost of uploading files to arweave
      // console.log(`[useCombineIdCard hook] about to upload this image to Arweave: ${previewImageUrl}`)
      // const data = {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     imageUrl: previewImageUrl,
      //     metadataJson: JSON.stringify(metadata),
      //   })
      // }
      // const response = await (await fetch("/api/combineTraits/arweaveUploadCost", data)).json()

      // if (response.error) {
      //   throw Error('Unable to fetch Arweave upload cost')
      // }

      // const uploadCost = response.cost

      // // Request the user to pay the cost
      // const tx = await sendUploadFund(
      //   uploadCost,
      //   connection,
      //   anchorWallet,
      //   () => setStatus(CombineIdCardStatus.UploadingToArweave)  // called after user signs transaction
      // )

      // // Upload files to arweave
      // const dataUpload = {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     imageUrl: previewImageUrl,
      //     metadataJson: metadata,
      //     tx: tx,
      //   })
      // }
      // const responseUpload = await (await fetch("/api/combineTraits/uploadNewAgent", dataUpload)).json()
      // const arweaveUploadResult: UploadResult = responseUpload
      // console.log('[useCombineIdCard hook] new arweave metadata url', arweaveUploadResult.metadataUrl)

      // if (arweaveUploadResult.error) {
      //   throw Error(arweaveUploadResult.error)
      // }

      // setNewArweaveMetadataUrl(arweaveUploadResult.metadataUrl)
      // setNewArweaveImageUrl(arweaveUploadResult.imageUrl)

      // setStatus(CombineIdCardStatus.ArweaveUploadSuccess)

      // Update the name in the metadata
      
      setStatus(CombineIdCardStatus.AwaitingUserSignatureForArweaveUpload)

      const newMetadata = JSON.stringify(metadata)
      console.log(newMetadata)
      const priceAtomic = await bundlr.getPrice(newMetadata.length);
      await bundlr.fund(priceAtomic);

      setStatus(CombineIdCardStatus.UploadingToArweave)

      const manifestId1 = await bundlr.upload(newMetadata, {tags: [{name: "content-type", value: "application/json"}]});
      const newMetadataUrl = `https://arweave.net/${manifestId1.id}/`;
      console.log(newMetadataUrl);

      setNewArweaveMetadataUrl(newMetadataUrl)
      setNewArweaveImageUrl(previewImageUrl)

      setStatus(CombineIdCardStatus.ArweaveUploadSuccess)

    } catch (error: any) {
      console.log(error)
      setStatus(CombineIdCardStatus.ArweaveUploadFailed)
    }
  }


  const updateOnChainMetadata = async (newAlias: string) => {

    try {
      console.log('[useCombineIdCard hook] updating on-chain metadata with new url')
      console.log(`[useCombineIdCard hook] new alias: ${newAlias}`)
      setStatus(CombineIdCardStatus.AwaitingUserSignatureForMetadataUpdate)

      const tx = await updateOnChainMetadataAfterCombine(
        selectedAgent.mint.toString(),
        ID_CARD_MINT.toString(),
        anchorWallet,
        connection,
        newArweaveMetadataUrl,
        newAlias,
        () => setStatus(CombineIdCardStatus.UpdatingOnChainMetadata)
      )
      console.log('[useCombineIdCard hook] Finished updating metadata. Tx: ', tx)

      setStatus(CombineIdCardStatus.MetadataUpdateSuccess)

    } catch (err: any) {
      console.log(err)
      setStatus(CombineIdCardStatus.MetadataUpdateFailed)
    }

    setIsCombining(false)
  }

  const resetStatus = async () => {
    setIsCombining(false)
    await refreshMetadataToDisplay()
  }

  const refetchNft = () => {
    fetchNFTs()
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
    uploadToArweave,
    updateOnChainMetadata,
    newArweaveImageUrl,
    refetchNft,
  }
}

export default useCombineIdCard