import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import * as mpl from "@metaplex/js"
import useAnchorWallet from "./useAnchorWallet"
import { NFT } from "./useWalletNFTs"
import { createNewAvatarMetadata } from "../utils/metadata"
import { sendUploadFund, UploadResult } from "../utils/mainnetUpload"
import { updateOnChainMetadataAfterCombine } from "../utils/sla/combine"
import { checkIfTraitCanBeCombined } from "../utils/sla/traits"



export enum CombineStatus {
  WalletNoConnected = "Wallet not connected",
  NothingSelected = "Nothing selected",
  AgentSelectedOnly = "Agent selected only",
  TraitSelectedOnly = "Trait selected only",
  GeneratingPreview = "Generating preview",
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

const useCombine = () => {
  const wallet = useWallet()
  const { anchorWallet } = useAnchorWallet()
  const { connection } = useConnection()

  const [selectedAgent, setSelectedAgent] = useState<NFT>(null)
  const [selectedTrait, setSelectedTrait] = useState<NFT>(null)
  const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)
  const [bothAgentAndTraitSelected, setBothAgentAndTraitSelected] = useState(false)

  const [status, setStatus] = useState<CombineStatus>(CombineStatus.WalletNoConnected)
  const [isCombining, setIsCombining] = useState(false)

  const [s3ImageUrl, setS3ImageUrl] = useState('')
  const [newArweaveMetadataUrl, setNewArweaveMetadataUrl] = useState('')


  // Log every change of status
  useEffect(() => {
    console.log(`[useCombine hook] setting status to ${status}`)
  }, [status])


  useEffect(() => {
    if (!wallet.publicKey) {
      setStatus(CombineStatus.WalletNoConnected)
    }
  }, [wallet.publicKey])


  // Update the combination of Llama & Trait
  const refreshMetadataToDisplay = async () => {
    if (selectedAgent && selectedTrait) {
      
      // Before generating a preview, make sure that the combination is allowed
      const combinationAllowed = await checkIfTraitCanBeCombined(
        selectedAgent, selectedTrait, connection, anchorWallet,
      )
      if (!combinationAllowed) { return }

      const newMetadata = createNewAvatarMetadata(selectedAgent.externalMetadata, selectedTrait.externalMetadata)
      setMetadataToDisplay(newMetadata)
      setBothAgentAndTraitSelected(true)
      setStatus(CombineStatus.GeneratingPreview)
    } else if (selectedAgent && !selectedTrait) {
      setMetadataToDisplay(selectedAgent.externalMetadata)
      setBothAgentAndTraitSelected(false)
      setStatus(CombineStatus.AgentSelectedOnly)
    } else if (!selectedAgent && selectedTrait) {
      setMetadataToDisplay(selectedTrait.externalMetadata)
      setBothAgentAndTraitSelected(false)
      setStatus(CombineStatus.TraitSelectedOnly)
    } else {
      setMetadataToDisplay(null)
      setBothAgentAndTraitSelected(false)
      setStatus(CombineStatus.NothingSelected)
    }
  }

  // Update the combination of Llama & Trait every time the user selects a different combination
  useEffect(() => {
    console.log('[useCombine hook] refreshing metadata to display')
    refreshMetadataToDisplay()
  }, [selectedAgent, selectedTrait])


  // Once the url from S3 is known, we're ready to display the preview
  const setReadyToCombine = () => {
    setStatus(CombineStatus.ReadyToCombine)
  }


  // Once the new metadata has been uploaded to Arweave, we can update the on-chain metadata
  useEffect(() => {
    if (newArweaveMetadataUrl && (status === CombineStatus.ArweaveUploadSuccess || status === CombineStatus.MetadataUpdateFailed)) {
      updateOnChainMetadata()
    }
  }, [newArweaveMetadataUrl, status])


  // Combine the Trait with the Llama
  const handleOnCombineClick = async () => {
    if (status === CombineStatus.ReadyToCombine) {
      setIsCombining(true)

      try {
        setStatus(CombineStatus.AwaitingUserSignatureForArweaveUpload)

        // Fetch cost of uploading files to arweave
        const data = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: s3ImageUrl,
            metadataJson: JSON.stringify(metadataToDisplay),
          })
        }
        const response = await (await fetch("/api/combineTraits/arweaveUploadCost", data)).json()
        const uploadCost = response.cost

        // Request the user to pay the cost
        const tx = await sendUploadFund(uploadCost, connection, anchorWallet)

        // Upload files to arweave
        setStatus(CombineStatus.UploadingToArweave)
        const dataUpload = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            imageUrl: s3ImageUrl,
            metadataJson: metadataToDisplay,
            tx: tx,
          })
        }
        const responseUpload = await (await fetch("/api/combineTraits/uploadNewAgent", dataUpload)).json()
        const arweaveUploadResult: UploadResult = responseUpload

        console.log('new arweave metadata url', arweaveUploadResult.metadataUrl)
        setNewArweaveMetadataUrl(arweaveUploadResult.metadataUrl)
        setStatus(CombineStatus.ArweaveUploadSuccess)

      } catch (error: any) {
        console.log(error)
        setStatus(CombineStatus.ArweaveUploadFailed)
      }
    }
  }

  const updateOnChainMetadata = async () => {

    try {
      console.log('Updating on-chain metadata with new url')
      setStatus(CombineStatus.AwaitingUserSignatureForMetadataUpdate)

      const tx = await updateOnChainMetadataAfterCombine(
        selectedAgent.mint,
        selectedTrait.mint,
        anchorWallet,
        connection,
        newArweaveMetadataUrl,
      )
      console.log('Finished updating metadata. Tx: ', tx)

      setStatus(CombineStatus.MetadataUpdateSuccess)

    } catch (err: any) {
      console.log(err)
      setStatus(CombineStatus.MetadataUpdateFailed)
    }

    setIsCombining(false)
  }

  const resetStatus = () => {
    setIsCombining(false)
    refreshMetadataToDisplay()
  }

  return {
    status,
    isCombining,
    resetStatus,
    selectedAgent,
    setSelectedAgent,
    selectedTrait,
    setSelectedTrait,
    bothAgentAndTraitSelected,
    metadataToDisplay,
    setS3ImageUrl,
    handleOnCombineClick,
    setReadyToCombine,
  }
}

export default useCombine