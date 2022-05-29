import { Spinner } from "theme-ui"

import NftSelectionDropdown from "../utils/NftSelectionDropdown"
import CombinedImage from "./CombinedImage"
import useWalletNFTs from "../../hooks/useWalletNFTs"
import styles from "../../styles/CombineMain.module.css"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"
import useCombine, { CombineStatus } from "../../hooks/useCombine"
import { useEffect, useState } from "react"
import { ModalContent } from "semantic-ui-react"


interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  size?: "small" | "large",
  confirmMessage?: string,
  keepOpenOnConfirm?: boolean,
  onClose?: () => void,
}


// const modalMessages: { [name: string]: ModalContent } = {
//   walletNotConnected: {
//     type: ModalType.Info,
//     content: (
//       <>
//         <p>Let's get you in disguise before the Alpacas find you.</p>
//         <p>Start by connecting your wallet at the top of this page.</p>
//       </>
//     ),
//     size: "small"
//   },
//   preCombineWarning: {
//     type: ModalType.Warning,
//     content: (
//       <>
//         <p>You are about to get in disguise.</p>
//         <p>This action is <strong>irreversible</strong>. So make sure you're happy with your new look!</p>
//         <div style={{ fontStyle: "italic", fontSize: "20px" }}>
//           <p><br /></p>
//           <p>Solana has been rather congested lately. If this transaction fails, don't worry - your funds are secure. Simply refresh the page and try again.</p>
//           <p>Thank you for your understanding!</p>
//         </div>
//       </>
//     ),
//     confirmMessage: "Combine",
//     size: "large",
//     keepOpenOnConfirm: true,
//   },
//   nftsNotSelected: {
//     type: ModalType.Info,
//     content: (
//       <>
//         <p>I can't alter your DNA without getting your consent - make sure you've selected both an Agent and a Trait to combine!</p>
//       </>
//     ),
//     size: "large"
//   },
//   generatingNewImage: {
//     type: ModalType.Info,
//     content: (
//       <>
//         <p>It looks like I wasn't able to generate a preview of your new look.</p>
//         <p>The most likely cause is you're trying to combine a trait already part of your DNA!</p>
//         <p>If not, please refresh the page and try again. 🦙</p>
//       </>
//     ),
//     size: "large"
//   },
//   combining: {
//     type: ModalType.Info,
//     content: (
//       <>
//         <p>Bear with me while I work my magic...</p>
//       </>
//     ),
//     size: "small"
//   }
// }


const CombineMain = () => {
  // const wallet = useWallet()
  // const { anchorWallet } = useAnchorWallet()
  // const { connection } = useConnection()
  // const { agentWalletNFTs, traitWalletNFTs } = useWalletNFTs()

  // const [selectedAgent, setSelectedAgent] = useState<NFT>(null)
  // const [selectedTrait, setSelectedTrait] = useState<NFT>(null)

  // const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)
  // const [bothLlamaAndTraitSelected, setBothLlamaAndTraitSelected] = useState(false)

  // const [readyToCombine, setReadyToCombine] = useState(false)
  // const [isCombining, setIsCombining] = useState(false)
  // const [isCombinedFinished, setIsCombinedFinished] = useState(false)
  // const [isCombineSuccess, setIsCombineSuccess] = useState(false)

  // const [s3ImageUrl, setS3ImageUrl] = useState('')
  // const [arweaveUploadDone, setArweaveUploadDone] = useState(false)

  // const [firstModalShown, setFirstModalShown] = useState(false)
  // const [modalContent, setModalContent] = useState<ModalContent>(modalMessages.walletNotConnected)

  // useEffect(() => {
  //   if (!wallet || !wallet.publicKey) {
  //     setModalContent(modalMessages.walletNotConnected)
  //   }
  //   else if (!selectedAgent || !selectedTrait) {
  //     setModalContent(modalMessages.nftsNotSelected)
  //   }
  //   else if (!readyToCombine) {
  //     setModalContent(modalMessages.generatingNewImage)
  //   } else if (isCombining) {
  //     setModalContent(modalMessages.combining)
  //   } else {
  //     setModalContent(modalMessages.preCombineWarning)
  //   }
  // }, [selectedAgent, selectedTrait, readyToCombine, wallet?.publicKey])

  // // Update the combination of Llama & Trait
  // useEffect(() => {
  //   if (selectedAgent && selectedTrait) {
  //     const newMetadata = createNewAvatarMetadata(selectedAgent.externalMetadata, selectedTrait.externalMetadata)
  //     console.log(newMetadata)
  //     setMetadataToDisplay(newMetadata)
  //     setBothLlamaAndTraitSelected(true)
  //   } else if (selectedAgent && !selectedTrait) {
  //     setMetadataToDisplay(selectedAgent.externalMetadata)
  //     setBothLlamaAndTraitSelected(false)
  //   } else if (!selectedAgent && selectedTrait) {
  //     setMetadataToDisplay(selectedTrait.externalMetadata)
  //     setBothLlamaAndTraitSelected(false)
  //   } else {
  //     setMetadataToDisplay(null)
  //     setBothLlamaAndTraitSelected(false)
  //   }
  // }, [selectedAgent, selectedTrait])

  // const handleOnCombineClick = async () => {
  //   try {
  //     setIsCombining(true)
  //     setFirstModalShown(true)
  //     setModalContent(modalMessages.combining)

  //     // Fetch cost of uploading files to arweave
  //     const data = {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         imageUrl: s3ImageUrl,
  //         metadataJson: JSON.stringify(metadataToDisplay),
  //       })
  //     }
  //     const response = await (await fetch("/api/combineTraits/arweaveUploadCost", data)).json()
  //     const uploadCost = response.cost

  //     // Request the user to pay the cost
  //     const tx = await sendUploadFund(uploadCost, connection, anchorWallet)

  //     // Upload files to arweave
  //     const dataUpload = {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({ 
  //         imageUrl: s3ImageUrl,
  //         metadataJson: metadataToDisplay,
  //         tx: tx,
  //       })
  //     }
  //     const responseUpload = await (await fetch("/api/combineTraits/uploadNewAgent", dataUpload)).json()
  //     const { metadataUrl, imageUrl }: UploadResult = responseUpload

  //     console.log('new metadata url', metadataUrl)

  //     if (metadataUrl) {
  //       setArweaveUploadDone(true)

  //       console.log('Executing merge')
  //       const tx = await updateOnChainMetadataAfterCombine(
  //         selectedAgent.mint,
  //         selectedTrait.mint,
  //         anchorWallet,
  //         connection,
  //         metadataUrl,
  //       )
  //       console.log('Finished excecuting merge: ', tx)
  //     }

  //     setIsCombineSuccess(true)
  //   } catch (err: any) {
  //     setIsCombineSuccess(false)
  //     console.log(err)
  //   } finally {
  //     setIsCombining(false)
  //     setIsCombinedFinished(true)
  //   }
  // }

  const { agentWalletNFTs, traitWalletNFTs } = useWalletNFTs()
  const {
    status,
    isCombining,
    setSelectedAgent,
    setSelectedTrait,
    bothAgentAndTraitSelected,
    metadataToDisplay,
    setS3ImageUrl,
    handleOnCombineClick,
    setReadyToCombine,
  } = useCombine()

  const [modalContent, setModalContent] = useState<ModalContent>(null)


  const getModalContent = () => {
    let content: ModalContent
    switch (status) {

      case CombineStatus.WalletNoConnected:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Let's get you in disguise before the Alpacas find you.</p>
              <p>Start by connecting your wallet at the top of this page.</p>
            </>
          ),
          size: "small"
        }
        break;

      case CombineStatus.NothingSelected:
      case CombineStatus.TraitSelectedOnly:
      case CombineStatus.AgentSelectedOnly:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>I can't alter your DNA without getting your consent - make sure you've selected both an Agent and a Trait to combine!</p>
              <br />
              <p>Also, make sure the trait you're trying to add is not already present on your Agent.</p>
            </>
          ),
          size: "large"
        }
        break;

      case CombineStatus.GeneratingPreview:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Give me a few moments to generate a preview for you.</p>
            </>
          )
        }
        break;

      case CombineStatus.ReadyToCombine:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>You are about to get in disguise.</p>
              <p>This action is <strong>irreversible</strong>. So make sure you're happy with your new look!</p>
              <div style={{ fontStyle: "italic", fontSize: "20px" }}>
                <p><br /></p>
                <p>Solana has been rather congested lately. If this transaction fails, don't worry - your funds are secure. Simply refresh the page and try again.</p>
                <p>Thank you for your understanding!</p>
              </div>
            </>
          ),
          confirmMessage: "Combine",
          keepOpenOnConfirm: true,
        }
        break;

      case CombineStatus.AwaitingUserSignatureForArweaveUpload:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>Waiting for arweave upload signature</p>
            </>
          )
        }
        break;

      case CombineStatus.UploadingToArweave:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>Uploading to Arweave...</p>
            </>
          )
        }
        break;

      case CombineStatus.ArweaveUploadFailed:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Something went wrong during Arweave upload.</p>
            </>
          ),
        }
        break;

      case CombineStatus.AwaitingUserSignatureForMetadataUpdate:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>Waiting for user's signature to update on-chain metadata</p>
            </>
          ),
        }
        break;

      case CombineStatus.UpdatingOnChainMetadata:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>Updating on-chain metadata</p>
            </>
          ),
        }
        break;

      case CombineStatus.MetadataUpdateFailed:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>On-chain metadata update failed.</p>
            </>
          ),
          confirmMessage: "Retry",
          keepOpenOnConfirm: true,
        }
        break;

      case CombineStatus.MetadataUpdateSuccess:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Success!</p>
            </>
          ),
        }
        break;

      default: 
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Looks like something went wrong.</p>
              <p>Refresh the page and try again.</p>
            </>
          )
        }
        break;
    }
    
    setModalContent(content)
  }

  // Refresh the modal every time the combine status changes
  useEffect(() => {
    getModalContent()
  }, [status])

  return (
    <div className={styles.container}>
      <div className={styles.dropdown_image_container}>
        <div className={styles.dropdowns_container}>
          <NftSelectionDropdown
            nfts={agentWalletNFTs}
            text="Select your agent"
            emptyText="No agent to display"
            onChange={setSelectedAgent}
          />
          <NftSelectionDropdown
            nfts={traitWalletNFTs}
            text="Select your trait"
            emptyText="No trait to display"
            onChange={setSelectedTrait}
          />
        </div>
        <div>
          <CombinedImage
            metadataOfImageToDisplay={metadataToDisplay}
            buildLayerByLayer={bothAgentAndTraitSelected}
            setImageUrlS3Callback={setS3ImageUrl}
            finishedLoadingCallback={setReadyToCombine}
          />
        </div>
      </div>
      <div className={styles.button_container}>
        <BasicModal
          onConfirm={handleOnCombineClick}
          {...modalContent}
          trigger={(
            <Button>
              {isCombining ? <Spinner /> : (status === CombineStatus.ReadyToCombine ? "combine" : "How To")}
            </Button>
          )}
        >
        </BasicModal>
      </div>
    </div>
  )
}

export default CombineMain