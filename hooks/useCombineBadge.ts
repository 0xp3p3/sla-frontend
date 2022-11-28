import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import * as mpl from "@metaplex/js"
import useAnchorWallet from "./useAnchorWallet"
import { NFT } from "./useWalletNFTs"
import { createNewAvatarMetadata } from "../utils/metadata"
import { sendUploadFund, UploadResult } from "../utils/mainnetUpload"
import { updateOnChainMetadataAfterCombine } from "../utils/sla/combine"
import { checkIfBadgeCanBeCombined } from "../utils/sla/badgeV2"
import useBadge from "./useBadge"



export enum BadgeCombineStatus {
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

const useCombineBadge = () => {
  const wallet = useWallet()
  const { anchorWallet } = useAnchorWallet()
  const { connection } = useConnection()

  const [selectedAgent, setSelectedAgent] = useState<NFT>(null)
  const [selectedBadge, setSelectedBadge] = useState<NFT>(null)
  const currentBadgeInfo = useBadge(selectedAgent?.mint)

  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(null)
  const [newArweaveMetadataUrl, setNewArweaveMetadataUrl] = useState('')
  const [newArweaveImageUrl, setNewArweaveImageUrl] = useState('')

  const [status, setStatus] = useState<BadgeCombineStatus>(BadgeCombineStatus.WalletNoConnected)
  const [isCombining, setIsCombining] = useState(false)


  // Log every change of status
  useEffect(() => {
    console.log(`[useCombineBadge hook] setting status to ${status}`)
  }, [status])


  // Log every time the image url changes
  useEffect(() => {
    console.log(`[useCombineBadge hook] new preview url: ${previewImageUrl}`)
  }, [previewImageUrl])


  // Update the combination of Llama & Trait every time the user selects a different combination
  useEffect(() => {
    if (!wallet.publicKey) {
      setStatus(BadgeCombineStatus.WalletNoConnected)
    } else {
      console.log('[useCombineBadge hook] refreshing metadata to display')
      refreshMetadataToDisplay()
    }
  }, [wallet.publicKey, selectedAgent, selectedBadge])


  const refreshMetadataToDisplay = async () => {

    if (!wallet.publicKey) { return }

    try {
      setIsPreviewLoading(true)

      let metadata: mpl.MetadataJson = null
      let bothNftsSelected = false
      let newStatus = BadgeCombineStatus.NothingSelected

      // Generate a preview if both an Agent and a Trait have been selected
      if (selectedAgent && selectedBadge) {
        // Before generating a preview, make sure that the combination is allowed
        const combinationAllowed = checkIfBadgeCanBeCombined(
          currentBadgeInfo.currentBadge, selectedBadge,
        )
        if (!combinationAllowed) { return }

        metadata = createNewAvatarMetadata(selectedAgent.externalMetadata, selectedBadge.externalMetadata)
        bothNftsSelected = true
        newStatus = BadgeCombineStatus.GeneratingPreview
      }

      // Show the agent if no trait has been selected
      else if (selectedAgent && !selectedBadge) {
        metadata = selectedAgent.externalMetadata
        newStatus = BadgeCombineStatus.AgentSelectedOnly
      }

      // Show the trait if no agent has been selected
      else if (!selectedAgent && selectedBadge) {
        metadata = selectedBadge.externalMetadata
        newStatus = BadgeCombineStatus.TraitSelectedOnly
      }

      const url = await getImageUrlToDisplay(metadata, bothNftsSelected)

      setMetadataToDisplay(metadata)
      setPreviewImageUrl(url)
      setStatus(newStatus)

    } catch (error: any) {
      console.log(error)
    } finally {
      setIsPreviewLoading(false)
    }

    // We're ready to combine if both the agent and trait are selected
    if (selectedAgent && selectedBadge) {
      setReadyToCombine()
    }
  }


  const getImageUrlToDisplay = async (metadata: mpl.MetadataJson | null, newCombinationNeeded: boolean): Promise<string> => {
    let newPreviewImageUrl: string = null

    if (metadata) {
      if (!newCombinationNeeded) {
        // No need to generate a new image if only 1 of {badge, llama} is selected
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
    console.log(`[useCombineBadge hook] setting status to ready to combine`)
    setStatus(BadgeCombineStatus.ReadyToCombine)
  }


  // Combine the Trait with the Llama
  const uploadToArweave = async () => {
    if (status === BadgeCombineStatus.ReadyToCombine) {
      setIsCombining(true)

      try {
        setStatus(BadgeCombineStatus.AwaitingUserSignatureForArweaveUpload)

        // Fetch cost of uploading files to arweave
        console.log(`[useCombineBadge hook] about to upload this image to Arweave: ${previewImageUrl}`)
        const data = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: previewImageUrl,
            metadataJson: JSON.stringify(metadataToDisplay),
          })
        }
        const response = await (await fetch("/api/combineTraits/arweaveUploadCost", data)).json()

        if (response.error) {
          throw Error('[useCombineBadge hook] Unable to fetch Arweave upload cost')
        }

        const uploadCost = response.cost
        console.log({ uploadCost })
        // Request the user to pay the cost
        const tx = await sendUploadFund(
          uploadCost,
          connection,
          anchorWallet,
          () => setStatus(BadgeCombineStatus.UploadingToArweave)  // called after user signs transaction
        )

        // Upload files to arweave
        const dataUpload = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            imageUrl: previewImageUrl,
            metadataJson: metadataToDisplay,
            tx: tx,
          })
        }


        const responseUpload = await (await fetch("/api/combineTraits/uploadNewAgent", dataUpload)).json()
        const arweaveUploadResult: UploadResult = responseUpload
        console.log('[useCombineBadge hook] new arweave metadata url', arweaveUploadResult.metadataUrl)

        if (arweaveUploadResult.error) {
          throw Error(arweaveUploadResult.error)
        }

        setNewArweaveMetadataUrl(arweaveUploadResult.metadataUrl)
        setNewArweaveImageUrl(arweaveUploadResult.imageUrl)

        setStatus(BadgeCombineStatus.ArweaveUploadSuccess)

      } catch (error: any) {
        console.log(error)
        setStatus(BadgeCombineStatus.ArweaveUploadFailed)
      }
    }
  }


  const updateOnChainMetadata = async () => {
    console.log(`\n\n\n UPDATE ON CHAIN METADATA \n\n\n`)
    try {
      console.clear()
      console.log('[useCombineBadge hook] Updating on-chain metadata with new url')
      console.log({ MD: metadataToDisplay.name })
      setStatus(BadgeCombineStatus.AwaitingUserSignatureForMetadataUpdate)

      const tx = await updateOnChainMetadataAfterCombine(
        selectedAgent.mint.toString(), //Address
        selectedBadge.mint.toString(), //Address
        anchorWallet, //Address
        connection, //Connection
        newArweaveMetadataUrl, //String
        metadataToDisplay.name, // string
        // null,
        () => setStatus(BadgeCombineStatus.UpdatingOnChainMetadata),
        currentBadgeInfo.currentBadge ? currentBadgeInfo.currentBadge.id + 1 : 2,  // Bronze has ID = 2
      )
      console.log('[useCombineBadge hook] Finished updating metadata. Tx: ', tx)

      setStatus(BadgeCombineStatus.MetadataUpdateSuccess)

    } catch (err: any) {
      console.log(err)
      setStatus(BadgeCombineStatus.MetadataUpdateFailed)
    }

    setIsCombining(false)
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
    selectedTrait: selectedBadge,
    setSelectedTrait: setSelectedBadge,
    isPreviewLoading,
    metadataToDisplay,
    previewImageUrl,
    setPreviewImageUrl,
    uploadToArweave,
    updateOnChainMetadata,
    setReadyToCombine,
    newArweaveImageUrl,
  }
}

export default useCombineBadge