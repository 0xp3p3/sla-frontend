import { useEffect, useState } from "react"
import useCandyMachine, { PreMintingStatus } from "../../hooks/useCandyMachine"
import useBalances from "../../hooks/useHayBalance"
import { SlaCollection } from "../../utils/constants"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"


interface ModalContent {
  type: ModalType,
  getContent: (collection: SlaCollection, balance?: number, nftLeft?: number) => JSX.Element,
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
  cmNotFetched: {
    type: ModalType.Info,
    getContent: (collection: SlaCollection) => (
      <>
        <p>It looks like something went wrong when fetching the {collection.name} collection.</p>
        <p>Please refresh the page and try again.</p>
      </>
    ),
    size: "large"
  },
  notLiveYet: {
    type: ModalType.Info,
    getContent: (collection: SlaCollection) => (
      <>
        <p>{collection.name} traits cannot be minted at this time.</p>
        <p>Check out <a href="/home#mint-llama">our countdown</a> and mark the date!</p>
      </>
    ),
    size: "large"
  },
  notEnoughHay: {
    type: ModalType.Info,
    getContent: (_, balance: number) => (
      <>
        <p>Looks like your wallet contains {`${balance}`} $HAY.</p>
        <p>Minting a new Trait costs 2 $HAY.</p>
        <p>Visit my colleague Agent Stacy in the <a href="/staking">Staking Room</a> to stake your Agent and generate more!</p>
        <p><br /></p>
        <p><strong>P.S.:</strong> Check out our <a href="/documents/Whitepaper.pdf" target="_blank" rel="noreferrer">whitepaper</a> if you want to know how to generate $HAY more quickly!</p>
      </>
    ),
    size: "large"
  },
  preMintWarning: {
    type: ModalType.Warning,
    getContent: (collection: SlaCollection, _, nftLeft: number) => (
      <>
        <p>You are about to mint {collection.expression}!</p>
        <p>Doing so will cost you 2 $HAY.</p>
        <p>Hurry up - only {nftLeft} left!</p>
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
  collection: SlaCollection
}


const TraitMintintButton = (props: Props) => {
  const { hayBalance } = useBalances()
  const {
    isMinting,
    onMint,
    preMintingStatus,
    cm,
  } = useCandyMachine(props.collection, hayBalance)

  const [modalContent, setModalContent] = useState<ModalContent>(modalMessages.walletNotConnected)

  useEffect(() => {
    switch (preMintingStatus) {
      case PreMintingStatus.WalletNotConnected:
        setModalContent(modalMessages.walletNotConnected)
        break;
      case PreMintingStatus.CmStateNotFetched:
        setModalContent(modalMessages.cmNotFetched)
        break;
      case PreMintingStatus.NotLiveYet:
        setModalContent(modalMessages.notLiveYet)
        break;
      case PreMintingStatus.BalanceTooSmall:
        setModalContent(modalMessages.notEnoughHay)
        break;
      case PreMintingStatus.Ready:
        setModalContent(modalMessages.preMintWarning)
        break;
    }
  }, [preMintingStatus])

  return (
    <BasicModal
      content={modalContent.getContent(props.collection, hayBalance, cm?.state.itemsRemaining)}
      onConfirm={onMint}
      {...modalContent}
      trigger={(
        <Button className="trait-mint" isWaiting={isMinting}>
          {"mint " + props.collection.name}
        </Button>
      )}
    >
    </BasicModal>
  )
}

export default TraitMintintButton