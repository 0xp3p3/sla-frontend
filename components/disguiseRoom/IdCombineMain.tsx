import { Spinner } from "theme-ui"

import NftSelectionDropdown from "../utils/NftSelectionDropdown"
import CombinedImage from "./CombinedImage"
import useWalletNFTs from "../../hooks/useWalletNFTs"
import styles from "../../styles/CombineMain.module.css"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"
import useCombineIdCard, { CombineIdCardStatus } from "../../hooks/useCombineIdCard"
import { useEffect, useState } from "react"
import { ModalContent, Progress } from "semantic-ui-react"
import AliasInput from "./AliasInput"


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

interface Props {
  dropdownRefreshToggle: boolean,
  refreshAllNfts: () => void,
}

const CombineMain = (props: Props) => {
  const { agentWalletNFTs, fetchNFTs } = useWalletNFTs()
  const {
    status,
    setStatus,
    isCombining,
    setSelectedAgent,
    previewImageUrl,
    isPreviewLoading,
    uploadToArweave,
    updateOnChainMetadata,
    resetStatus,
  } = useCombineIdCard()

  const [modalContent, setModalContent] = useState<ModalContent>(null)
  const combineFeatureOff = process.env.NEXT_PUBLIC_COMBINE_FEATURE_OFF! == 'false'

  const [newAlias, setNewAlias] = useState<string | null>(null)
  const [confirmedClicked, setConfirmedClicked] = useState(false)

  // Refetch all NFTs when the switch toggles
  useEffect(() => {
    fetchNFTs()
  }, [props.dropdownRefreshToggle])

  useEffect(() => {
    console.log(`[idCombineMain] new alias set to ${newAlias}`)
  }, [newAlias])

  useEffect(() => {
    console.log(`[idCombineMain] Rename was click`)
    if (confirmedClicked) {
      uploadToArweave(newAlias)
    }
  }, [confirmedClicked])

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

      case CombineIdCardStatus.WalletNoConnected:
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

      case CombineIdCardStatus.NoIdCardInWallet:
        content = (
          content = {
            type: ModalType.Info,
            content: (
              <>
                <p>{`Oops, it looks like your wallet doesn't contain any ID Card.`}</p>
                <br/>
                <p>Go back to Step 3 to mint one!</p>
              </>
            ),
          }
        )
        break;

      case CombineIdCardStatus.NothingSelected:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>{`I cant alter your alias without your consent - make sure you've selected an Agent to update!`}</p>
              <br />
              <p>{`Also, make sure you have an ID Card in your wallet.`}</p>
            </>
          ),
          size: "large"
        }
        break;

      case CombineIdCardStatus.ReadyToCombine:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>What should your new alias be?</p>
              <AliasInput
                setNameCallback={(alias: string) => { setNewAlias(alias) }}
              />
              <div style={{ fontStyle: "italic", fontSize: "20px" }}>
                <br />
                <p>{`Solana has been rather congested lately. If one of these transactions fail, don't worry - your funds are secure. Simply try again!`}</p>
              </div>
            </>
          ),
          confirmMessage: "Rename",
          keepOpenOnConfirm: true,
          onConfirm: () => { setConfirmedClicked(true) }
        }
        break;

      case CombineIdCardStatus.AwaitingUserSignatureForArweaveUpload:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>The first step is to update your alias in the off-chain metadata.</p>
              <p>{`There's a small fee associated with that (somewhere around $0.1-0.3).`}</p>
              <p>{`Make sure you comfirm the transaction popping up from your wallet and I'll take it from there.`}</p>
              {getProgressBar(33)}
            </>
          )
        }
        break;

      case CombineIdCardStatus.UploadingToArweave:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>{`I'm updating your metadata on Arweave.`}</p>
              <p style={{ fontStyle: "italic" }}>Please be patient, this might take up to 2 minutes to complete.</p>
              {getProgressBar(67)}
            </>
          )
        }
        break;

      case CombineIdCardStatus.ArweaveUploadFailed:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>Something went wrong during the upload to Arweave. Either you cancelled the transaction, or Solana is heavily congested at the moment.</p>
              <br />
              <p>{`If you still want to change your alias, simply click "Try again".`}</p>
            </>
          ),
          onCancel: () => {
            resetStatus()
            setConfirmedClicked(false)
            setNewAlias(null)
          },
          onConfirm: () => {
            setConfirmedClicked(true)
          },
          confirmMessage: "Try again",
          keepOpenOnConfirm: true,
        }
        break;

      case CombineIdCardStatus.ArweaveUploadSuccess:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>Your new alias has been successfully uploaded to Arweave.</p>
              <p>{`Click "Next" to move on to the next step.`}</p>
              {getProgressBar(100)}
            </>
          ),
          onConfirm: () => { updateOnChainMetadata(newAlias) },
          onCancel: () => {
            resetStatus()
            setConfirmedClicked(false)
            setNewAlias(null)
          },
          confirmMessage: "Next",
          keepOpenOnConfirm: true,
        }
        break;

      case CombineIdCardStatus.AwaitingUserSignatureForMetadataUpdate:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>The last thing to do is to update the blockchain accordingly.</p>
              <p>There should be a new transaction popping up for you to sign.</p>
              {getProgressBar(33)}
            </>
          ),
        }
        break;

      case CombineIdCardStatus.UpdatingOnChainMetadata:
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

      case CombineIdCardStatus.MetadataUpdateFailed:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>Something went wrong while updating the on-chain metadata.</p>
              <br />
              <p>{`If you still want to alter your look, simply click "Retry".`}</p>
            </>
          ),
          onCancel: () => {
            resetStatus()
            setConfirmedClicked(false)
            setNewAlias(null)
          },
          confirmMessage: "Retry",
          keepOpenOnConfirm: true,
          onConfirm: () => { setStatus(CombineIdCardStatus.ArweaveUploadSuccess) }
        }
        break;

      case CombineIdCardStatus.MetadataUpdateSuccess:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Congratulations, you successfully modified your Alias!</p>
              <br />
              <p>Agent Franz out.</p>
            </>
          ),
          onClose: async () => {
            props.refreshAllNfts()
            setSelectedAgent(null)
            resetStatus()
            setConfirmedClicked(false)
            setNewAlias(null)
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
        disabled={!newAlias}
          {...modalContent}
          trigger={(
            <Button>
              {isCombining ? <Spinner /> : (status === CombineIdCardStatus.ReadyToCombine ? "rename" : "How To")}
            </Button>
          )}
        >
        </BasicModal>
      </div>
    </div>
  )
}

export default CombineMain