import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import * as mpl from "@metaplex/js"
import useAnchorWallet from "./useAnchorWallet"
import { NFT } from "./useWalletNFTs"
import { createNewAvatarMetadata } from "../utils/metadata"
import { sendUploadFund, UploadResult } from "../utils/mainnetUpload"
import { updateOnChainMetadataAfterCombine } from "../utils/sla/combine"
import { checkIfTraitCanBeCombined } from "../utils/sla/traits"
import { SLA_TOKEN_TYPE } from "../utils/constants"



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

  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(null)
  const [newArweaveMetadataUrl, setNewArweaveMetadataUrl] = useState('')
  const [newArweaveImageUrl, setNewArweaveImageUrl] = useState('')

  const [newAlias, setNewAlias] = useState<string>(null)

  const [status, setStatus] = useState<CombineStatus>(CombineStatus.WalletNoConnected)
  const [isCombining, setIsCombining] = useState(false)


  // Log every change of status
  useEffect(() => {
    console.log(`[useCombine hook] setting status to ${status}`)
  }, [status])


  // Log every time the image url changes
  useEffect(() => {
    console.log(`[useCombine hook] new preview url: ${previewImageUrl}`)
  }, [previewImageUrl])


  useEffect(() => {
    if (!wallet.publicKey) {
      setStatus(CombineStatus.WalletNoConnected)
    } else {
      refreshMetadataToDisplay()
    }
  }, [wallet.publicKey])


  // Update the combination of Llama & Trait every time the user selects a different combination
  useEffect(() => {
    console.log('[useCombine hook] refreshing metadata to display')
    refreshMetadataToDisplay()
  }, [selectedAgent, selectedTrait])


  const refreshMetadataToDisplay = async () => {

    if (!wallet.publicKey) { return }

    try {
      setIsPreviewLoading(true)

      let metadata: mpl.MetadataJson = null
      let newCombinationNeeded = false
      let newStatus = CombineStatus.NothingSelected

      // Generate a preview if both an Agent and a Trait have been selected
      if (selectedAgent && selectedTrait) {
        if (selectedTrait.type === SLA_TOKEN_TYPE.TRAIT) {

          // Before generating a preview, make sure that the combination is allowed
          const combinationAllowed = await checkIfTraitCanBeCombined(
            selectedAgent, selectedTrait, connection, anchorWallet,
          )
          if (!combinationAllowed) { return }

          metadata = createNewAvatarMetadata(selectedAgent.externalMetadata, selectedTrait.externalMetadata)
          newCombinationNeeded = true
          newStatus = CombineStatus.GeneratingPreview
        }

        else if (selectedTrait.type === SLA_TOKEN_TYPE.ID_CARD) {
          metadata = selectedAgent.externalMetadata
        }

        newStatus = CombineStatus.ReadyToCombine
      }

      // Show the agent if no trait has been selected
      else if (selectedAgent && (!selectedTrait || (selectedTrait && !(selectedTrait.type === SLA_TOKEN_TYPE.TRAIT)))) {
        metadata = selectedAgent.externalMetadata
        newStatus = CombineStatus.AgentSelectedOnly
      }

      // Show the trait if no agent has been selected
      else if (!selectedAgent && selectedTrait && (selectedTrait.type === SLA_TOKEN_TYPE.TRAIT)) {
        metadata = selectedTrait.externalMetadata
        newStatus = CombineStatus.TraitSelectedOnly
      }

      console.log(metadata)
      const url = await getImageUrlToDisplay(metadata, newCombinationNeeded)

      setMetadataToDisplay(metadata)
      setPreviewImageUrl(url)
      setStatus(newStatus)

    } catch (error: any) {
      console.log(error)
    } finally {
      setIsPreviewLoading(false)
    }
  }


  const getImageUrlToDisplay = async (metadata: mpl.MetadataJson | null, newCombinationNeeded: boolean): Promise<string> => {
    let newPreviewImageUrl: string = null

    if (metadata) {
      if (!newCombinationNeeded) {
        // No need to generate a new image if only 1 of {trait, llama} is selected
        newPreviewImageUrl = metadata.image
      } else {
        // If both are selected, we need to create / fetch a new image from S3
        newPreviewImageUrl = await pushNewImageToS3(metadata)
      }
    }

    return newPreviewImageUrl
  }

  const pushNewImageToS3 = async (metadata: mpl.MetadataJson): Promise<string> => {
    const data = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ attributes: metadata.attributes })
    }
    const response = await fetch("/api/combineTraits/createNewAgent", data)
    const responseBody = await response.json()

    return responseBody.url
  }


  // Once the url from S3 is known, we're ready to display the preview
  const setReadyToCombine = () => {
    console.log(`setting status to ready to combine`)
    setStatus(CombineStatus.ReadyToCombine)
  }

  // Combine the Trait with the Llama
  const uploadToArweave = async () => {
    if (status === CombineStatus.ReadyToCombine) {
      setIsCombining(true)

      console.log(`New alias before uploading: ${newAlias}`)

      let metadata: mpl.MetadataJson = JSON.parse(JSON.stringify(metadataToDisplay))
      if (newAlias && selectedAgent) {
        metadata.name = newAlias
        metadata.image = '0.png'
        metadata.properties.files[0].uri = '0.png'
      }

      try {
        setStatus(CombineStatus.AwaitingUserSignatureForArweaveUpload)

        console.log('before upload', metadata)

        // Fetch cost of uploading files to arweave
        console.log(`[useCombine hook] about to upload this image to Arweave: ${previewImageUrl}`)
        const data = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: previewImageUrl,
            metadataJson: JSON.stringify(metadata),
          })
        }
        const response = await (await fetch("/api/combineTraits/arweaveUploadCost", data)).json()

        if (response.error) {
          throw Error('Unable to fetch Arweave upload cost')
        }

        const uploadCost = response.cost

        // Request the user to pay the cost
        const tx = await sendUploadFund(
          uploadCost,
          connection,
          anchorWallet,
          () => setStatus(CombineStatus.UploadingToArweave)  // called after user signs transaction
        )

        // Upload files to arweave
        const dataUpload = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            imageUrl: previewImageUrl,
            metadataJson: metadata,
            tx: tx,
          })
        }
        const responseUpload = await (await fetch("/api/combineTraits/uploadNewAgent", dataUpload)).json()
        const arweaveUploadResult: UploadResult = responseUpload
        console.log('[combine hook] new arweave metadata url', arweaveUploadResult.metadataUrl)

        if (arweaveUploadResult.error) {
          throw Error(arweaveUploadResult.error)
        }

        setNewArweaveMetadataUrl(arweaveUploadResult.metadataUrl)
        setNewArweaveImageUrl(arweaveUploadResult.imageUrl)

        setStatus(CombineStatus.ArweaveUploadSuccess)

      } catch (error: any) {
        console.log(error)
        setStatus(CombineStatus.ArweaveUploadFailed)
      }
    }
  }


  const updateOnChainMetadata = async () => {

    try {
      console.log('[combine hook] Updating on-chain metadata with new url')
      console.log(`[combine hook] new alias: ${newAlias}`)
      setStatus(CombineStatus.AwaitingUserSignatureForMetadataUpdate)

      const tx = await updateOnChainMetadataAfterCombine(
        selectedAgent.mint.toString(),
        selectedTrait.mint.toString(),
        anchorWallet,
        connection,
        newArweaveMetadataUrl,
        newAlias,
        () => setStatus(CombineStatus.UpdatingOnChainMetadata)
      )
      console.log('[combine hook] Finished updating metadata. Tx: ', tx)

      setStatus(CombineStatus.MetadataUpdateSuccess)

    } catch (err: any) {
      console.log(err)
      setStatus(CombineStatus.MetadataUpdateFailed)
    }

    setIsCombining(false)
  }

  const resetStatus = async () => {
    console.log(`[combine hook] resetting status`)
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
    selectedTrait,
    setSelectedTrait,
    isPreviewLoading,
    metadataToDisplay,
    previewImageUrl,
    setPreviewImageUrl,
    uploadToArweave,
    updateOnChainMetadata,
    setReadyToCombine,
    newArweaveImageUrl,
    newArweaveMetadataUrl,
    newAlias,
    setNewAlias,
  }
}

export default useCombine