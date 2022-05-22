import { useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { Progress, Image, Loader } from "semantic-ui-react"
import useCandyMachine, { MintingStatus, PreMintingStatus } from "../../hooks/useCandyMachine"
import useBalances from "../../hooks/useBalances"
import { NFT } from "../../hooks/useWalletNFTs"
import { SlaCollection } from "../../utils/constants"
import { getNFTMetadata } from "../../utils/nfts"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"


interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  size?: "small" | "large",
  confirmMessage?: string,
  keepOpenOnConfirm?: boolean,
  onClose?: () => void,
}


interface Props {
  collection: SlaCollection
}


const TraitMintintButton = (props: Props) => {
  const { connection } = useConnection()
  const { hayBalance } = useBalances()
  const {
    isMinting,
    onMint,
    preMintingStatus,
    mintingStatus,
    cm,
  } = useCandyMachine(props.collection, hayBalance)

  const [modalContent, setModalContent] = useState<ModalContent>(null)
  const [isPreMinting, setIsPreMinting] = useState(true)
  const [newTrait, setNewTrait] = useState<NFT>(null)

  const getPreMintingStatus = () => {
    let content: ModalContent
    switch (preMintingStatus) {

      case PreMintingStatus.WalletNotConnected:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Welcome to the Disguise Room!</p>
              <p>Start by connecting your wallet at the top of this page.</p>
            </>
          ),
          size: "small"
        }
        break;

      case PreMintingStatus.CmStateNotFetched:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>It looks like something went wrong when fetching the {props.collection.name} collection.</p>
              <p>Please refresh the page and try again.</p>
            </>
          )
        }
        break;

      case PreMintingStatus.NotLiveYet:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>{props.collection.name} traits cannot be minted at this time.</p>
              <p>Check out <a href="/home#mint-llama">our countdown</a> and mark the date!</p>
            </>
          )
        }
        break;

      case PreMintingStatus.BalanceTooSmall:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Looks like your wallet contains {`${hayBalance}`} $HAY.</p>
              <p>Minting a new Trait costs 2 $HAY.</p>
              <p>Visit my colleague Agent Stacy in the <a href="/staking">Staking Room</a> to stake your Agent and generate more!</p>
              <p><br /></p>
              <p><strong>P.S.:</strong> Check out our <a href="/documents/Whitepaper.pdf" target="_blank" rel="noreferrer">whitepaper</a> if you want to know how to generate $HAY more quickly!</p>
            </>
          )
        }
        break;

      case PreMintingStatus.Ready:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>You are about to mint {props.collection.expression}!</p>
              <p>Doing so will cost you 2 $HAY.</p>
              <p>Hurry up - only {cm?.state?.itemsRemaining} left!</p>
              <div style={{ fontStyle: "italic", fontSize: "20px" }}>
                <p><br /></p>
                <p>Solana has been rather congested lately. If this transaction fails, don't worry - your funds are secure. Simply refresh the page and try again.</p>
                <p>Thank you for your understanding!</p>
              </div>
            </>
          ),
          confirmMessage: "Mint",
          size: "large",
          keepOpenOnConfirm: true,
        }
        break;
    }
    setModalContent(content)
  }

  const getProgressPercentage = (): number => {
    let percent: number;
    switch (mintingStatus) {
      case MintingStatus.PreparingTransaction:
        percent = 20
        break;
      case MintingStatus.SendingTransaction:
        percent = 40
        break;
      case MintingStatus.RequestingConfirmation:
        percent = 60
        break;
      case MintingStatus.WaitingConfirmation:
        percent = 80
        break;
      case MintingStatus.Success:
      case MintingStatus.Failure:
        percent = 100
        break;
    }
    return percent
  }

  const handleOnResetModal = () => {
    setIsPreMinting(true)
    setNewTrait(null)
  }

  const getMintingStatus = () => {
    let content: ModalContent
    switch (mintingStatus) {
      case MintingStatus.PreparingTransaction:
      case MintingStatus.SendingTransaction:
      case MintingStatus.RequestingConfirmation:
      case MintingStatus.WaitingConfirmation:
        content = {
          type: ModalType.Waiting,
          content: (
            <>
              <p>You are going to love this new Trait my friend.</p>
              <p>Bear with me while I get that for you...</p>
              <Progress percent={getProgressPercentage()} />
            </>
          ),
        }
        break;

      case MintingStatus.Success:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Congratulations, the mint was successful! 🎉</p>
              <p>Here's your new {props.collection.name} Trait:</p>
              {!newTrait ? <Loader>Loading</Loader> : (
                <Image size='small' src={newTrait.externalMetadata.image} className={""} />
              )}
            </>
          ),
          onClose: handleOnResetModal
        }
        break;

      case MintingStatus.Failure:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Oops, it looks like the mint failed.</p>
              <p>Sorry about that, I must be a littley sleepy today.</p>
              <p>Refresh the page and try again!</p>
            </>
          ),
          onClose: handleOnResetModal
        }
    }
  }

  useEffect(() => {
    if (isPreMinting) {
      getPreMintingStatus()
    } else {
      getMintingStatus()
    }
  }, [preMintingStatus, mintingStatus])

  const handleOnMintConfirm = async () => {
    setIsPreMinting(false)
    const mint = await onMint()
    if (mint) {
      const nft = await getNFTMetadata(mint.toString(), connection)
      setNewTrait(nft)
    }
  }

  return (
    <BasicModal
      content={modalContent}
      onConfirm={handleOnMintConfirm}
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