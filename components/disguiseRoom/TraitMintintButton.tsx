import { useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"


interface ModalContent {
  type: ModalType,
  getContent: (trait?: string, balance?: number) => JSX.Element,
  size: "small" | "large",
  confirmMessage?: string,
}

const modalMessages: { [name: string]: ModalContent } = {
  walletNotConnected: {
    type: ModalType.Info,
    getContent: (_) => (
      <>
        <p>Welcome to the Disguise Room!</p>
        <p>Start by connecting your wallet at the top of this page.</p>
      </>
    ),
    size: "small"
  },
  notEnoughHay: {
    type: ModalType.Info,
    getContent: (_, balance: number) => (
      <>
        <p>Looks like your wallet contains {`${balance}`} $HAY.</p>
        <p>Minting a new Trait costs 2 $HAY.</p>
        <p>Visit the <a href="/staking">Staking Room</a> to stake your Agent and generate more!</p>
        <p><br/></p>
        <p><strong>P.S.:</strong> Check out our <a href="/documents/Whitepaper.pdf" target="_blank" rel="noreferrer">whitepaper</a> if you want to know how to generate $HAY more quickly!</p>
      </>
    ),
    size: "large"
  },
  preMintWarning: {
    type: ModalType.Warning,
    getContent: (trait: string) => (
      <>
        <p>You are about to mint {trait}!</p>
        <p>Doing so will cost you 2 $HAY.</p>
        <div style={{ fontStyle: "italic", fontSize: "20px" }}>
          <p><br /></p>
          <p>Solana has been rather congested lately. If this transaction fails, don't worry - your funds are secure. Simply refresh the page and try again.</p>
          <p>Thank you for your understanding!</p>
        </div>
      </>
    ),
    confirmMessage: "Mint",
    size: "large",
  }
}


interface Props {
  traitButtonName: string,
  traitExpression: string,  // example: "a new pair of Eyes"
}


const TraitMintintButton = (props: Props) => {
  const wallet = useWallet()

  const [hayBalance, setHayBalance] = useState<number>(0)

  const [modalContent, setModalContent] = useState<ModalContent>(modalMessages.walletNotConnected)

  useEffect(() => {
    if (!wallet || !wallet.publicKey) {
      setModalContent(modalMessages.walletNotConnected)
    } else if (hayBalance < 2) {
      setModalContent(modalMessages.notEnoughHay)
    } else {
      setModalContent(modalMessages.preMintWarning)
    }
  }, [wallet?.publicKey, hayBalance])

  return (
    <BasicModal 
      content={modalContent.getContent(props.traitExpression, hayBalance)}
      {...modalContent}
      trigger={<Button className="trait-mint">{"mint " + props.traitButtonName}</Button>}
    >

    </BasicModal>
  )
}

export default TraitMintintButton