import { Spinner } from "theme-ui"

import NftSelectionDropdown from "../utils/NftSelectionDropdown"
import CombinedImage from "./CombinedImage"
import useWalletNFTs from "../../hooks/useWalletNFTs"
import styles from "../../styles/CombineMain.module.css"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"
import useCombineIdCard, { CombineScannerStatus } from "../../hooks/useCombineScanner"
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

interface Props {
  dropdownRefreshToggle: boolean,
  refreshAllNfts: () => void,
}

const ScannerCombineMain = (props: Props) => {
  const { agentWalletNFTs, fetchNFTs } = useWalletNFTs()
  const {
    status,
    isCombining,
    setSelectedAgent,
    previewImageUrl,
    isPreviewLoading,
    scanAgent,
    resetStatus,
  } = useCombineIdCard()

  const [modalContent, setModalContent] = useState<ModalContent>(null)
  const combineFeatureOff = process.env.NEXT_PUBLIC_COMBINE_FEATURE_OFF! == 'false'

  // Refetch all NFTs when the switch toggles
  useEffect(() => {
    fetchNFTs()
  }, [props.dropdownRefreshToggle])


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

      case CombineScannerStatus.WalletNoConnected:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>{`It's time to find out if you are an Imposter.`}</p>
              <p>Start by connecting your wallet at the top of this page.</p>
            </>
          ),
          size: "small"
        }
        break;

      case CombineScannerStatus.NoScannerInWallet:
        content = (
          content = {
            type: ModalType.Info,
            content: (
              <>
                <p>{`Oops, it looks like your wallet doesn't contain any DNA Scanning Device.`}</p>
                <br/>
                <p>Go back to Step 5 to mint one!</p>
              </>
            ),
          }
        )
        break;

      case CombineScannerStatus.NothingSelected:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>{`You need to select an Agent to scan!`}</p>
              <br />
              <p>{`Also, make sure you have a DNA Scanning Device in your wallet.`}</p>
            </>
          ),
          size: "large"
        }
        break;

      case CombineScannerStatus.ReadyToCombine:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>You are about to scan your Llama Agent.</p>
              <p>If your agent is one of the 25 Imposters in the collection, it will be <strong>permanently</strong> changed into an Alpaca. </p>
              <br />
              <p>This action will take some time, please be patient. Thank you!</p>
              <br />
              <div style={{ fontStyle: "italic", fontSize: "20px" }}>
                <p>{`Solana has been rather congested lately. If one of these transactions fail, don't worry - your funds are secure. Simply try again!`}</p>
              </div>
            </>
          ),
          confirmMessage: "scan",
          keepOpenOnConfirm: true,
          onConfirm: scanAgent,
        }
        break;

      case CombineScannerStatus.ScanningAgent:
      case CombineScannerStatus.AwaitingUserSignature:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>Bear with me while I scan your Agent.</p>
              {getProgressBar(30)}
            </>
          )
        }
        break;

      case CombineScannerStatus.AwaitingUserSignature:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>We are reaching the end of the scan.</p>
              <p>{`Make sure you comfirm the transaction popping up from your wallet and I'll do the rest.`}</p>
              {getProgressBar(60)}
            </>
          )
        }
        break;

      case CombineScannerStatus.UpdatingOnChainMetadata:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>Almost there. We are just waiting for the transaction to complete.</p>
              {getProgressBar(80)}
            </>
          )
        }
        break;

      case CombineScannerStatus.ScanningFailed:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>Something went wrong during the scanning process. In most likelihood, Solana is heavily congested at the moment.</p>
              <br />
              <p>{`If you still want to scan your agent, simply click "Try again".`}</p>
            </>
          ),
          onCancel: resetStatus,
          onConfirm: scanAgent,
          confirmMessage: "Try again",
          keepOpenOnConfirm: true,
        }
        break;

      case CombineScannerStatus.ScanningSuccess:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>You successfully scanned your agent!</p>
              <br />
              <p>Agent Franz out.</p>
            </>
          ),
          onClose: async () => {
            props.refreshAllNfts()
            setSelectedAgent(null)
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
            <p>We are in the process of updating our ecosystem - agents cannot be scanned right now. </p>
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
          {...modalContent}
          trigger={(
            <Button>
              {isCombining ? <Spinner /> : (status === CombineScannerStatus.ReadyToCombine ? "scan" : "How To")}
            </Button>
          )}
        >
        </BasicModal>
      </div>
    </div>
  )
}

export default ScannerCombineMain