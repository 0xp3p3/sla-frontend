import { Wallet } from "@project-serum/anchor"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"

import { mintIdCard } from "../../utils/sla/idCard"
import { useEffect, useMemo, useState } from "react"
import { Loader, Progress } from "semantic-ui-react"



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
  mintWarning: {
    type: ModalType.Warning,
    content: (
      <>
        <p>{`Go ahead and click "Mint" to get your ID card!`}</p>
        <p>Doing so will cost you 60 $HAY.</p>
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
        <p>{`You're minting a new ID Card.`}</p>
        <p>Make sure to confirm the transaction popping up.</p>
        <br />
        <Progress percent={50} active color="green">Minting an ID Card...</Progress>
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

const IdCardMain = () => {
  const { connection } = useConnection()
  const wallet = useWallet()

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
    } else {
      setModalContent(modalMessages.mintWarning)
    }
  }

  useEffect(() => {
    console.log('[ID Card mint] refreshing modal content')
    refreshModalContent()
  }, [wallet])

  const onMintConfirm = async () => {
    if (!wallet || !wallet.publicKey || !wallet.connected) {
      console.log(`Wallet is not connected`)
      return;
    }

    console.log(`[ID Card mint] starting to mint an ID Card`)
    try {
      setIsMinting(true)
      setModalContent(modalMessages.minting)
      const signature = await mintIdCard(anchorWallet, connection)
      setModalContent(modalMessages.success)
      console.log(`[ID Card mint] finished minting an ID Card`)
    } catch (error: any) {
      console.log(`[ID Card mint] could not mint a new ID Card`)
      console.log(error)
      setModalContent(modalMessages.failure)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyItems: "center", width: "100%", justifyContent: "center", marginTop: "70px", flexWrap: "wrap" }}>
        <img src="images/ID-Card.png" loading="lazy" alt="" className="llama-img step-3 select dis" />
        <BasicModal
          {...modalContent}
          onConfirm={onMintConfirm}
          trigger={<Button isWaiting={isMinting}>Mint</Button>}
          onClose={refreshModalContent}
        >
        </BasicModal>
      </div>
    </>
  )
}

export default IdCardMain