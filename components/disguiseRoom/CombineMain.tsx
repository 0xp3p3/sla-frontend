import { Spinner } from "theme-ui"

import NftSelectionDropdown from "../utils/NftSelectionDropdown"
import CombinedImage from "./CombinedImage"
import useWalletNFTs from "../../hooks/useWalletNFTs"
import styles from "../../styles/CombineMain.module.css"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"
import useCombine, { CombineStatus } from "../../hooks/useCombine"
import { useEffect, useState } from "react"
import { ModalContent, Progress } from "semantic-ui-react"


interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  size?: "small" | "large",
  confirmMessage?: string,
  keepOpenOnConfirm?: boolean,
  onClose?: () => void,
  onCancel?: () => void,
  onConfirm?: () => void,
}


const CombineMain = () => {
  const { agentWalletNFTs, traitWalletNFTs, fetchNFTs } = useWalletNFTs()
  const {
    status,
    setStatus,
    isCombining,
    setSelectedAgent,
    setSelectedTrait,
    previewImageUrl,
    isPreviewLoading,
    uploadToArweave,
    updateOnChainMetadata,
    setReadyToCombine,
    resetStatus,
    newArweaveImageUrl,
  } = useCombine()

  const [modalContent, setModalContent] = useState<ModalContent>(null)
  const combineFeatureOff = process.env.NEXT_PUBLIC_COMBINE_FEATURE_OFF! == 'false'


  const getProgressBar = (perc: number) => {
    return (
      <>
        <Progress percent={perc} active={perc < 100} color="green"></Progress>
      </>
    )

  }

  const getModalContent = () => {
    let content: ModalContent
    switch (status) {

      case CombineStatus.WalletNoConnected:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>{`Let's get you in disguise before the Alpacas find you.`}</p>
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
              <p>{`I cant alter your DNA without your consent - make sure you've selected both an Agent and a Trait to combine!`}</p>
              <br />
              <p>{`Also, make sure the trait you're trying to add is not already present on your Agent.`}</p>
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
              <p>This action is <strong>irreversible</strong>. {`So make sure you're happy with your new look!`}</p>
              <div style={{ fontStyle: "italic", fontSize: "20px" }}>
                <br />
                <p>{`Solana has been rather congested lately. If one of these transactions fail, don't worry - your funds are secure. Simply try again!`}</p>
              </div>
            </>
          ),
          confirmMessage: "Combine",
          keepOpenOnConfirm: true,
          onConfirm: uploadToArweave,
        }
        break;

      case CombineStatus.AwaitingUserSignatureForArweaveUpload:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>The first step is to upload your new look and metadata information to Arweave.</p>
              <p>{`There's a small fee associated with that (somewhere around $0.1-0.3).`}</p>
              <p>{`Make sure you comfirm the transaction popping up from your wallet and I'll take it from there.`}</p>
              {getProgressBar(33)}
            </>
          )
        }
        break;

      case CombineStatus.UploadingToArweave:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>{`I'm uploading your new look and metadata to Arweave.`}</p>
              <p style={{ fontStyle: "italic" }}>Please be patient, this might take up to 2 minutes to complete.</p>
              {getProgressBar(67)}
            </>
          )
        }
        break;

      case CombineStatus.ArweaveUploadFailed:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>Something went wrong during the upload to Arweave. Either you cancelled the transaction, or Solana is heavily congested at the moment.</p>
              <br />
              <p>{`If you still want to alter your look, simply click "Try again".`}</p>
            </>
          ),
          onCancel: () => {
            resetStatus()
            setReadyToCombine()
          },
          onConfirm: () => {
            setReadyToCombine()
            uploadToArweave()
          },
          confirmMessage: "Try again",
          keepOpenOnConfirm: true,
        }
        break;

      case CombineStatus.ArweaveUploadSuccess:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>Your new look and metadata have been successfully uploaded to Arweave.</p>
              <p>Please double check that the image <a href={newArweaveImageUrl} target="_blank" rel="noreferrer">here (click me!)</a> is the new look that you expected.</p>
              <p>{`Once satisfied, click "Next" to move on to the next step.`}</p>
              {getProgressBar(100)}
            </>
          ),
          onConfirm: updateOnChainMetadata,
          onCancel: () => resetStatus(),
          confirmMessage: "Next",
          keepOpenOnConfirm: true,
        }
        break;

      case CombineStatus.AwaitingUserSignatureForMetadataUpdate:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>The last thing to do is to update the blockchain accordingly.</p>
              <p>There should be a new transaction popping up for you to sign.</p>
              {getProgressBar(33)}
              <p style={{ fontStyle: "italic" }}>Please be aware that this step will <strong>permanently</strong> change the look of your Agent and <strong>permanently</strong> burn your Trait NFT.</p>
            </>
          ),
        }
        break;

      case CombineStatus.UpdatingOnChainMetadata:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>{`I'm updating the metadata of your Agent on the Solana blockchain.`}</p>
              <p style={{ fontStyle: "italic" }}>Please be patient, this might take up to 2 minutes to complete.</p>
              {getProgressBar(67)}
            </>
          ),
        }
        break;

      case CombineStatus.MetadataUpdateFailed:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>Something went wrong while updating the on-chain metadata.</p>
              <br />
              <p>{`If you still want to alter your look, simply click "Retry".`}</p>
            </>
          ),
          onCancel: resetStatus,
          confirmMessage: "Retry",
          keepOpenOnConfirm: true,
          onConfirm: () => { setStatus(CombineStatus.ArweaveUploadSuccess) }
        }
        break;

      case CombineStatus.MetadataUpdateSuccess:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Congratulations, you successfully combined a Trait with your Llama Agent!</p>
              <br />
              <p>Come back to see me when you want to add to your disguise. In the meantime, stay safe from the Alpacas!</p>
              <br />
              <p>Agent Franz out.</p>
            </>
          ),
          onClose: async () => {
            await fetchNFTs()
            setSelectedAgent(null)
            setSelectedTrait(null)
            resetStatus()
          },
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

    if (combineFeatureOff) {
      content = {
        type: ModalType.Info,
        content: (
          <>
            <p>We are in the process of updating our ecosystem - traits cannot be combined right now. </p>
            <p>Check our Discord for more information! ❤️ </p>
          </>
        )
      }
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
            previewImageUrl={previewImageUrl}
            isPreviewLoading={isPreviewLoading}
          />
        </div>
      </div>
      <div className={styles.button_container}>
        <BasicModal
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