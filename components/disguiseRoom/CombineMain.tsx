import { useEffect, useState } from "react"
import * as mpl from '@metaplex/js'
import { useWallet } from "@solana/wallet-adapter-react"
import { Spinner } from "theme-ui"

import NftSelectionDropdown from "../utils/NftSelectionDropdown"
import CombinedImage from "./CombinedImage"
import { createNewAvatarMetadata } from "../../utils/metadata"
import useWalletNFTs, { NFT } from "../../hooks/useWalletNFTs"
import styles from "../../styles/CombineMain.module.css"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"
import { sleep } from "../../utils/connection"


interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  confirmMessage?: string,
  size: "small" | "large",
  keepOpenOnConfirm?: boolean,
  onClose?: () => void,
}


const modalMessages: { [name: string]: ModalContent } = {
  walletNotConnected: {
    type: ModalType.Info,
    content: (
      <>
        <p>Let's get you in disguise before the Alpacas find you.</p>
        <p>Start by connecting your wallet at the top of this page.</p>
      </>
    ),
    size: "small"
  },
  preCombineWarning: {
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
    size: "large",
    keepOpenOnConfirm: true,
  },
  nftsNotSelected: {
    type: ModalType.Info,
    content: (
      <>
        <p>I can't alter your DNA without getting your consent - make sure you've selected both an Agent and a Trait to combine!</p>
      </>
    ),
    size: "small"
  },
  generatingNewImage: {
    type: ModalType.Info,
    content: (
      <>
        <p>It looks like I wasn't able to generate a preview of your new look.</p>
        <p>The most likely cause is you're trying to combine a trait already part of your DNA!</p>
        <p>If not, please refresh the page and try again. 🦙</p>
      </>
    ),
    size: "small"
  },
  combining: {
    type: ModalType.Info,
    content: (
      <>
        <p>Bear with me while I work my magic...</p>
      </>
    ),
    size: "small"
  }
}


const CombineMain = () => {
  const wallet = useWallet()
  const { agentWalletNFTs, traitWalletNFTs } = useWalletNFTs()

  const [selectedAgent, setSelectedAgent] = useState<NFT>(null)
  const [selectedTrait, setSelectedTrait] = useState<NFT>(null)

  const [metadataToDisplay, setMetadataToDisplay] = useState<mpl.MetadataJson>(null)
  const [bothLlamaAndTraitSelected, setBothLlamaAndTraitSelected] = useState(false)

  const [readyToCombine, setReadyToCombine] = useState(false)
  const [isCombining, setIsCombining] = useState(false)
  const [isCombinedFinished, setIsCombinedFinished] = useState(false)
  const [isCombineSuccess, setIsCombineSuccess] = useState(false)

  const [firstModalShown, setFirstModalShown] = useState(false)
  const [modalContent, setModalContent] = useState<ModalContent>(modalMessages.walletNotConnected)

  useEffect(() => {
    if (!wallet || !wallet.publicKey) {
      setModalContent(modalMessages.walletNotConnected)
    }
    else if (!selectedAgent || !selectedTrait) {
      setModalContent(modalMessages.nftsNotSelected)
    }
    else if (!readyToCombine) {
      setModalContent(modalMessages.generatingNewImage)
    } else if (isCombining) {
      setModalContent(modalMessages.combining)
    } else {
      setModalContent(modalMessages.preCombineWarning)
    }
  }, [selectedAgent, selectedTrait, readyToCombine, wallet?.publicKey])

  // Update the combination of Llama & Trait
  useEffect(() => {
    if (selectedAgent && selectedTrait) {
      const newMetadata = createNewAvatarMetadata(selectedAgent.externalMetadata, selectedTrait.externalMetadata)
      console.log(newMetadata)
      setMetadataToDisplay(newMetadata)
      setBothLlamaAndTraitSelected(true)
    } else if (selectedAgent && !selectedTrait) {
      setMetadataToDisplay(selectedAgent.externalMetadata)
      setBothLlamaAndTraitSelected(false)
    } else if (!selectedAgent && selectedTrait) {
      setMetadataToDisplay(selectedTrait.externalMetadata)
      setBothLlamaAndTraitSelected(false)
    } else {
      setMetadataToDisplay(null)
      setBothLlamaAndTraitSelected(false)
    }
  }, [selectedAgent, selectedTrait])

  const handleOnCombineClick = async () => {
    try {
      setIsCombining(true)
      setFirstModalShown(true)
      setModalContent(modalMessages.combining)
      await sleep(5000)
      setIsCombineSuccess(true)
    } catch (err: any) {
      setIsCombineSuccess(false)
      console.log(err)
    } finally {
      setIsCombining(false)
      setIsCombinedFinished(true)
    }
  }

  const prepareModalContent = (content: JSX.Element) => {
    let newContent = content

    if (!firstModalShown) {
      newContent = (
        <>
          <p>Welcome back Agent!</p>
          {newContent}
        </>
      )
    }

    if (isCombinedFinished) {
      newContent = (
        <>
          {newContent}
          {isCombining ? <Spinner /> : isCombinedFinished ? (isCombineSuccess ? (
            <p>You're all set - congratulations! 🎉</p>
          ) : (
            <>
              <p>It looks like something went wrong.</p>
              <p>Please refresh the page and try again.</p>
            </>
          )) : <></>}
        </>
      )
    }
    return newContent
  }

  const { content, ...otherOptions } = modalContent

  return (
    <div className={styles.container}>
      <div className={styles.dropdown_image_container}>
        <div className={styles.dropdowns_container}>
          <NftSelectionDropdown
            nfts={agentWalletNFTs}
            text="Select your llama"
            onChange={setSelectedAgent}
          />
          <NftSelectionDropdown
            nfts={traitWalletNFTs}
            text="Select your trait"
            onChange={setSelectedTrait}
          />
        </div>
        <div>
          <CombinedImage
            metadataOfImageToDisplay={metadataToDisplay}
            buildLayerByLayer={bothLlamaAndTraitSelected}
            finishedLoadingCallback={setReadyToCombine}
          />
        </div>
      </div>
      <div className={styles.button_container}>
        <BasicModal
          onConfirm={handleOnCombineClick}
          onClose={() => setFirstModalShown(true)}
          content={prepareModalContent(content)}
          {...otherOptions}
          trigger={(
            <Button>
              {isCombining ? <Spinner /> : "combine"}
            </Button>
          )}
        >
        </BasicModal>
      </div>
    </div>
  )
}

export default CombineMain