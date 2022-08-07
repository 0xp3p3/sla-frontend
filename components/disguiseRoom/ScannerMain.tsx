import { Wallet } from "@project-serum/anchor"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"

import { mintScanner } from "../../utils/sla/scanner"
import { useEffect, useMemo, useState } from "react"
import { Progress } from "semantic-ui-react"
import styles from "../../styles/CombineMain.module.css"
import NftSelectionDropdown from "../utils/NftSelectionDropdown"
import useWalletNFTs, { NFT } from "../../hooks/useWalletNFTs"
import CombinedImage from "./CombinedImage"



interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  size: "small" | "large",
  confirmMessage?: string,
  keepOpenOnConfirm?: boolean,
}

const modalMessages: { [name: string]: ModalContent } = {
  walletNotConnected: {
    type: ModalType.Info,
    content: (
      <>
        <p>Start by connecting your wallet at the top of this page.</p>
      </>
    ),
    size: "small"
  },
  agentNotSelected: {
    type: ModalType.Info,
    content: (
      <>
        <p>{`You must first select an agent that will mint the Scanning Device`}</p>
      </>
    ),
    size: "small"
  },
  mintWarning: {
    type: ModalType.Warning,
    content: (
      <>
        <p>{`Go ahead and click "Mint" to get a DNA Scanning Device!`}</p>
        <p>Doing so will cost you 10 $HAY.</p>
        <div style={{ fontStyle: "italic", fontSize: "20px" }}>
          <p><br /></p>
          <p>{`Solana has been rather congested lately. If this transaction fails, don't worry - your funds are secure. Simply refresh the page and try again.`}</p>
          <p>Thank you for your understanding!</p>
        </div>
      </>
    ),
    confirmMessage: "Mint",
    size: "large",
    keepOpenOnConfirm: true,
  },
  minting: {
    type: ModalType.Waiting,
    content: (
      <>
        <p>{`You're minting a new Scanning Device.`}</p>
        <p>Make sure to confirm the transaction popping up.</p>
        <br />
        <Progress percent={50} active color="green">Minting a Scanning Device...</Progress>
        <br />
        <p style={{ fontStyle: 'italic' }}>Please be patient, this might take up to 2 minutes.</p>

      </>
    ),
    size: "large",
  },
  success: {
    type: ModalType.Info,
    content: (
      <>
        <p>Congratulations, the mint was successful! 🎉</p>
      </>
    ),
    size: "large"
  },
  failure: {
    type: ModalType.Info,
    content: (
      <>
        <p>Oops, it looks like the mint failed.</p>
        <p>Sorry about that, it looks like Solana is acting up again.</p>
        <p>Refresh the page and try again!</p>
      </>
    ),
    size: "large",
  }
}

const ScannerMain = () => {
  const { connection } = useConnection()
  const wallet = useWallet()

  const { agentWalletNFTs } = useWalletNFTs()
  const [selectedAgent, setSelectedAgent] = useState<NFT | null>(null)

  const [isMinting, setIsMinting] = useState(false)
  const [modalContent, setModalContent] = useState<ModalContent>(modalMessages.walletNotConnected)

  const anchorWallet = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
      return
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as Wallet
  }, [wallet])

  const refreshModalContent = () => {
    if (!wallet || !wallet.publicKey || !wallet.connected) {
      setModalContent(modalMessages.walletNotConnected)
    } else if (!selectedAgent) {
      setModalContent(modalMessages.agentNotSelected)
    } else {
      setModalContent(modalMessages.mintWarning)
    }
  }

  useEffect(() => {
    console.log('[Scanner mint] refreshing modal content')
    refreshModalContent()
  }, [wallet, selectedAgent])

  const onMintConfirm = async () => {
    if (!wallet || !wallet.publicKey || !wallet.connected) {
      console.log(`[Scanner mint] Wallet is not connected`)
      return;
    }

    if (!selectedAgent) {
      console.log(`[Scanner mint] No agent selected.`)
      return
    }

    console.log(`[Scanner mint] starting to mint a Scanner`)
    try {
      setIsMinting(true)
      setModalContent(modalMessages.minting)
      const signature = await mintScanner(anchorWallet, connection)
      setModalContent(modalMessages.success)
      
      console.log(`[Scanner mint] finished minting a Scanner`)
    } catch (error: any) {
      console.log(`[Scanner mint] could not mint a new Scanner`)
      console.log(error)
      setModalContent(modalMessages.failure)
    } finally {
      setIsMinting(false)
    }
  }

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
            previewImageUrl={"images/scanner.png"}
            isPreviewLoading={false}
          />
        </div>
      </div>
      <div className={styles.button_container}>
        <BasicModal
          {...modalContent}
          onConfirm={onMintConfirm}
          trigger={<Button isWaiting={isMinting}>Mint</Button>}
          onClose={refreshModalContent}
        >
        </BasicModal>
      </div>
    </div>
  )
}

export default ScannerMain