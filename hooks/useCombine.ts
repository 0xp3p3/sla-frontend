import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import * as mpl from "@metaplex/js"
import useAnchorWallet from "./useAnchorWallet"
import { NFT } from "./useWalletNFTs"
import { createNewAvatarMetadata } from "../utils/metadata"
import { updateOnChainMetadataAfterCombine } from "../utils/sla/combine"
import { checkIfTraitCanBeCombined } from "../utils/sla/traits"
import { type WebBundlr } from "@bundlr-network/client";
// import type { DataItem, Bundle } from "arbundles";
// import { createData, ArweaveSigner, bundleAndSignData } from "arbundles"; 
import { AnchorProvider } from "@coral-xyz/anchor";


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
  const bundlrProvider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "processed",
    commitment: "processed",
  });
  // var ephemeralSigner : ArweaveSigner

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

  useEffect(() => {
    if (!wallet.publicKey) {
      setStatus(CombineStatus.WalletNoConnected)
    } else {
      refreshMetadataToDisplay()
    }
  }, [wallet.publicKey])


  // Update the combination of Llama & Trait every time the user selects a different combination
  useEffect(() => {
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
    console.log('pushNewImage========')
    const response = await fetch("/api/combineTraits/createNewAgent", data)
    const responseBody = await response.json()

    return responseBody.url
  }


  // Once the url from S3 is known, we're ready to display the preview
  const setReadyToCombine = () => {
    setStatus(CombineStatus.ReadyToCombine)
  }

  // Combine the Trait with the Llama
  const uploadToArweave = async () => {

    if (status === CombineStatus.ReadyToCombine) {
      setIsCombining(true)

      try {
        setStatus(CombineStatus.AwaitingUserSignatureForArweaveUpload)

        console.log(previewImageUrl)
        
        // const response = await fetch(previewImageUrl, {mode: "no-cors",credentials: 'include',})
        // const response = await fetch(previewImageUrl, {
        //   method: "GET",
        //   headers: {
        //     'Access-Control-Allow-Origin': '*'
        //   },
        // })
        // const imageData = await response.arrayBuffer()
        // const imageType = response.headers.get("content-type")

        // // -- upload 2 files simultaneously
        // const files = [
        //   {
        //     data: imageData,
        //     type: imageType,
        //     path: "0.png",
        //   },
        //   { data: new TextEncoder().encode(JSON.stringify(metadataToDisplay)), type: "application/json", path: "metadata.json" },
        // ];

        // const JWK = await Arweave.crypto.generateJWK();
        // ephemeralSigner = new ArweaveSigner(JWK);

        // const preppedFiles = await prepFiles(files);
        // const bundle = await bundleItems(preppedFiles);
        // const size = bundle.getRaw().byteLength
        // const price = await bundlr.getPrice(size);
        // await bundlr.fund(price);
        // setStatus(CombineStatus.UploadingToArweave)
        // const manifestId = await uploadBundle(bundle);

        // // const arweaveUploadResult: 
        // const newImageUrl = `https://arweave.net/${manifestId}/0.png`;
        // const newMetadataUrl = `https://arweave.net/${manifestId}/metadata.json`;
        
        // -- upload 2 files in bundles separately
        // const files1 = [
        //   {
        //     data: imageData,
        //     type: imageType,
        //     path: "image",
        //   },
        // ];

        // const JWK = await Arweave.crypto.generateJWK();
        // ephemeralSigner = new ArweaveSigner(JWK);

        // const preppedFiles0 = await prepFiles(files1);
        // const bundle0 = await bundleItems(preppedFiles0);
        // const size0 = bundle0.getRaw().byteLength
        // const price0 = await bundlr.getPrice(size0);
        // await bundlr.fund(price0);
        // setStatus(CombineStatus.UploadingToArweave)
        // const manifestId0 = await uploadBundle(bundle0);

        // // const arweaveUploadResult: 
        // const newImageUrl = `https://arweave.net/${manifestId0}`;
        // console.log("====imageUrl=====", newImageUrl);

        // Object.keys(metadataToDisplay).forEach(e => {
        //   if(e == "image") metadataToDisplay[e] = newImageUrl;
        // })

        // const files2 = [
        //   { data: new TextEncoder().encode(JSON.stringify(metadataToDisplay)), type: "application/json", path: "" },
        // ];

        // const preppedFiles = await prepFiles(files2);
        // const bundle = await bundleItems(preppedFiles);
        // const size = bundle.getRaw().byteLength
        // const price = await bundlr.getPrice(size);
        // await bundlr.fund(price);
        // const manifestId = await uploadBundle(bundle);

        // // const arweaveUploadResult: 
        // const newMetadataUrl = `https://arweave.net/${manifestId}/`;
        // console.log("====metadataUrl=====", newMetadataUrl);

        // setNewArweaveMetadataUrl(newImageUrl)
        // setNewArweaveImageUrl(newMetadataUrl)

        // setStatus(CombineStatus.ArweaveUploadSuccess)

        // -- upload 2 files separately
        // const JWK = await Arweave.crypto.generateJWK();
        // ephemeralSigner = new ArweaveSigner(JWK);

        // var priceAtomic = await bundlr.getPrice(imageData.byteLength);
        // await bundlr.fund(priceAtomic);
        // const manifestId0 = await bundlr.upload(Buffer.from(imageData), {tags: [{name: "content-type", value: "image/png"}]});
        // // console.log(manifestId0)
        // const newImageUrl = `https://arweave.net/${manifestId0.id}?ext=png`;

        const newImageUrl = previewImageUrl
        
        const newMetadata = JSON.stringify(metadataToDisplay).replaceAll("0.png", newImageUrl)
        console.log(newMetadata)
        const priceAtomic = await bundlr.getPrice(newMetadata.length);
        await bundlr.fund(priceAtomic);

        setStatus(CombineStatus.UploadingToArweave)

        const manifestId1 = await bundlr.upload(newMetadata, {tags: [{name: "content-type", value: "application/json"}]});
        const newMetadataUrl = `https://arweave.net/${manifestId1.id}/`;
        console.log(newMetadataUrl);

        setNewArweaveMetadataUrl(newMetadataUrl)
        setNewArweaveImageUrl(newImageUrl)

        setStatus(CombineStatus.ArweaveUploadSuccess)

      } catch (error: any) {
        console.log(error)
        setStatus(CombineStatus.ArweaveUploadFailed)
      }
    }
  }

  // const prepFiles = async (files: file[]) : Promise<Map<string, DataItem>> => {
  //   const items = await Promise.all(
  //     Array.from(files).map(async (file) => {
  //       return [file.path, await prepFile(file)];
  //     }),
  //   );
  //   return new Map(items);
  // }

  // const prepFile = async (file: file ): Promise<DataItem> => {
  //   const item = createData(file.data, ephemeralSigner, {
  //     tags: [{ name: "Content-Type", value: file.type }],
  //   });
  //   await item.sign(ephemeralSigner);
  //   return item;
  // }

  // const  bundleItems = async (itemMap: Map<string, DataItem>): Promise<Bundle> => {
  //   const pathMap = new Map<string, string>([...itemMap].map(([path, item]) => [path, item.id]));
    
  //   const manifestItem = await createData(JSON.stringify(await bundlr.uploader.generateManifest({ items: pathMap })), ephemeralSigner, {
  //     tags: [
  //       { name: "Type", value: "manifest" },
  //       { name: "Content-Type", value: "application/x.arweave-manifest+json" },
  //     ],
  //   });
  //   const bundle = await bundleAndSignData([...itemMap.values(), manifestItem], ephemeralSigner);
  //   return bundle;
  // }

  // const uploadBundle = async (bundle: Bundle): Promise<string> => {
  //   const tx = bundlr.createTransaction(bundle.getRaw(), {
  //     tags: [
  //       { name: "Bundle-Format", value: "binary" },
  //       { name: "Bundle-Version", value: "2.0.0" },
  //     ],
  //   });
  //   await tx.sign();
  //   const res = await tx.upload();
  //   const manifestId = bundle.items[bundle.items.length - 1].id;
  //   return manifestId;
  // }


  const updateOnChainMetadata = async () => {

    try {
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

      setStatus(CombineStatus.MetadataUpdateSuccess)

    } catch (err: any) {
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