import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import * as mpl from "@metaplex/js"
import useAnchorWallet from "./useAnchorWallet"
import { NFT } from "./useWalletNFTs"
import { createNewAvatarMetadata } from "../utils/metadata"
// import { sendUploadFund, UploadResult, prepFiles, bundleItems, uploadBundle } from "../utils/mainnetUpload"
import { updateOnChainMetadataAfterCombine } from "../utils/sla/combine"
import { checkIfTraitCanBeCombined } from "../utils/sla/traits"
import Arweave from "arweave";
import { type WebBundlr } from "@bundlr-network/client";
import type { DataItem, Bundle } from "arbundles";
import { createData, ArweaveSigner, bundleAndSignData } from "arbundles"; 
import { Provider } from "@project-serum/anchor";


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
  const bundlrProvider = new Provider(connection, anchorWallet, {
    preflightCommitment: "processed",
    commitment: "processed",
  });
  var ephemeralSigner : ArweaveSigner

  const [selectedAgent, setSelectedAgent] = useState<NFT>(null)
  const [selectedTrait, setSelectedTrait] = useState<NFT>(null)

  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(null)
  const [newArweaveMetadataUrl, setNewArweaveMetadataUrl] = useState('')
  const [newArweaveImageUrl, setNewArweaveImageUrl] = useState('')
  const [bundlr, setBundlr] = useState<WebBundlr | undefined>(undefined)

  const [status, setStatus] = useState<CombineStatus>(CombineStatus.WalletNoConnected)
  const [isCombining, setIsCombining] = useState(false)

  type file = { data: Uint8Array; type: string; path: string };

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

  const refreshMetadataToDisplay = async () => {

    if (!wallet.publicKey) { return }

    try {
      setIsPreviewLoading(true)

      let metadata: mpl.MetadataJson = null
      let bothNftsSelected = false
      let newStatus = CombineStatus.NothingSelected

      // Generate a preview if both an Agent and a Trait have been selected
      if (selectedAgent && selectedTrait) {

        // Before generating a preview, make sure that the combination is allowed
        const combinationAllowed = await checkIfTraitCanBeCombined(
          selectedAgent, selectedTrait, connection, anchorWallet,
        )
        if (!combinationAllowed) { return }

        metadata = createNewAvatarMetadata(selectedAgent.externalMetadata, selectedTrait.externalMetadata)
        bothNftsSelected = true
        newStatus = CombineStatus.GeneratingPreview
      }

      // Show the agent if no trait has been selected
      else if (selectedAgent && !selectedTrait) {
        metadata = selectedAgent.externalMetadata
        newStatus = CombineStatus.AgentSelectedOnly
      }

      // Show the trait if no agent has been selected
      else if (!selectedAgent && selectedTrait) {
        metadata = selectedTrait.externalMetadata
        newStatus = CombineStatus.TraitSelectedOnly
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
    if (selectedAgent && selectedTrait) {
      setReadyToCombine()
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

  const dataURLtoFile = (dataurl: string, filename: string) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
  }


  // Combine the Trait with the Llama
  const uploadToArweave = async () => {
    console.log(`function entry: ${previewImageUrl}`)

    if (status === CombineStatus.ReadyToCombine) {
      setIsCombining(true)

      try {
        setStatus(CombineStatus.AwaitingUserSignatureForArweaveUpload)

        // Fetch cost of uploading files to arweave
        // console.log(`[useCombine hook] about to upload this image to Arweave: ${previewImageUrl}`)
        // const data = {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     imageUrl: previewImageUrl,
        //     metadataJson: JSON.stringify(metadataToDisplay),
        //   })
        // }
        // const response = await (await fetch("/api/combineTraits/arweaveUploadCost", data)).json()

        // if (response.error) {
        //   throw Error('Unable to fetch Arweave upload cost')
        // }

        // const uploadCost = response.cost

        // Request the user to pay the cost
        // const tx = await sendUploadFund(
        //   uploadCost,
        //   connection,
        //   anchorWallet,
        //   () => setStatus(CombineStatus.UploadingToArweave)  // called after user signs transaction
        // )

        // Upload files to arweave
        // const dataUpload = {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json"
        //   },
        //   body: JSON.stringify({
        //     imageUrl: previewImageUrl,
        //     metadataJson: metadataToDisplay,
        //     tx: tx,
        //   })
        // }
        // const responseUpload = await (await fetch("/api/combineTraits/uploadNewAgent", dataUpload)).json()
        // const arweaveUploadResult: UploadResult = responseUpload
        // console.log('new arweave metadata url', arweaveUploadResult.metadataUrl)

        // const file0 = dataURLtoFile(previewImageUrl, '0.png');
        // const blob = new Blob([JSON.stringify(metadataToDisplay)], { type: 'text/plain' });
        // const file1 = new File([blob], "metadata.json", {type: "text/plain"});
        // const files: File[] = [file0, file1];

        const response = await fetch(previewImageUrl)
        const imageData = await response.arrayBuffer()
        const imageType = response.headers.get("content-type")

        console.log(imageData, imageType)
        const files = [
          {
            data: imageData,
            type: imageType,
            path: "0.png",
          },
          { data: new TextEncoder().encode(JSON.stringify(metadataToDisplay)), type: "application/json", path: "metadata.json" },
        ];

        const JWK = await Arweave.crypto.generateJWK();
        ephemeralSigner = new ArweaveSigner(JWK);

        console.log('anchorWallet ----- ', anchorWallet)
        // const WebBundlr = (await import("@bundlr-network/client")).WebBundlr;

        // const bundlr = new WebBundlr("https://node1.bundlr.network", 'solana', bundlrProvider.wallet, { providerUrl: process.env.NEXT_PUBLIC_SOLANA_ENDPOINT });
        
        // await bundlr.ready()
        // setBundlr(bundlr);

        console.log("bundlrProvider.wallet ---- ", bundlrProvider.wallet);

        const preppedFiles = await prepFiles(files);
        const bundle = await bundleItems(preppedFiles);
        const size = bundle.getRaw().byteLength
        const price = await bundlr.getPrice(size);
        console.log(price)
        console.log("bundlr----- ", bundlr)
        await bundlr.fund(price);
        setStatus(CombineStatus.UploadingToArweave)
        const manifestId = await uploadBundle(bundle);

        console.log(manifestId);

        // const arweaveUploadResult: 
        const newImageUrl = `https://arweave.net/${manifestId}/0.png`;
        const newMetadataUrl = `https://arweave.net/${manifestId}/metadata.json`;

        // if (arweaveUploadResult.error) {
        //   throw Error(arweaveUploadResult.error)
        // }
        // console.log({ AM: arweaveUploadResult.metadataUrl })
        setNewArweaveMetadataUrl(newImageUrl)
        setNewArweaveImageUrl(newMetadataUrl)

        setStatus(CombineStatus.ArweaveUploadSuccess)

      } catch (error: any) {
        console.log(error)
        setStatus(CombineStatus.ArweaveUploadFailed)
      }
    }
  }

  const prepFiles = async (files: file[]) : Promise<Map<string, DataItem>> => {
    const items = await Promise.all(
      Array.from(files).map(async (file) => {
        return [file.path, await prepFile(file)];
      }),
    );
    return new Map(items);
  }

  const prepFile = async (file: file ): Promise<DataItem> => {
    const item = createData(file.data, ephemeralSigner, {
      tags: [{ name: "Content-Type", value: file.type }],
    });
    await item.sign(ephemeralSigner);
    return item;
  }

  const  bundleItems = async (itemMap: Map<string, DataItem>): Promise<Bundle> => {
    const pathMap = new Map<string, string>([...itemMap].map(([path, item]) => [path, item.id]));
    
    const manifestItem = await createData(JSON.stringify(await bundlr.uploader.generateManifest({ items: pathMap })), ephemeralSigner, {
      tags: [
        { name: "Type", value: "manifest" },
        { name: "Content-Type", value: "application/x.arweave-manifest+json" },
      ],
    });
    const bundle = await bundleAndSignData([...itemMap.values(), manifestItem], ephemeralSigner);
    return bundle;
  }

  const uploadBundle = async (bundle: Bundle): Promise<string> => {
    const tx = bundlr.createTransaction(bundle.getRaw(), {
      tags: [
        { name: "Bundle-Format", value: "binary" },
        { name: "Bundle-Version", value: "2.0.0" },
      ],
    });
    await tx.sign();
    const res = await tx.upload();
    // console.log(res);
    const manifestId = bundle.items[bundle.items.length - 1].id;
    console.log(`Manifest ID: ${manifestId}`);
    return manifestId;
  }


  const updateOnChainMetadata = async () => {

    try {
      console.log('Updating on-chain metadata with new url')
      setStatus(CombineStatus.AwaitingUserSignatureForMetadataUpdate)

      const tx = await updateOnChainMetadataAfterCombine(
        selectedAgent.mint.toString(),
        selectedTrait.mint.toString(),
        anchorWallet,
        connection,
        newArweaveMetadataUrl,
        null,
        () => setStatus(CombineStatus.UpdatingOnChainMetadata)
      )
      console.log('Finished updating metadata. Tx: ', tx)

      setStatus(CombineStatus.MetadataUpdateSuccess)

    } catch (err: any) {
      console.log(err)
      setStatus(CombineStatus.MetadataUpdateFailed)
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
  }
}

export default useCombine