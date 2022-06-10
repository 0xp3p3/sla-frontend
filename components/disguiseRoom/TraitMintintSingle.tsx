import { useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { Progress, Image, Loader, Dimmer, Segment } from "semantic-ui-react"
import useCandyMachine, { MintingStatus, PreMintingStatus } from "../../hooks/useCandyMachine"
import useBalances from "../../hooks/useBalances"
import { NFT } from "../../hooks/useWalletNFTs"
import { SlaCollection } from "../../utils/constants"
import { getNFTMetadata } from "../../utils/nfts"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal";
import styles from "../../styles/TraitMintingSingle.module.css";


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


const TraitMintintSingle = (props: Props) => {
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
        }
        break;
    }
    setModalContent(content)
  }

  const getProgressPercentage = (): number => {
    let percent: number;
    switch (mintingStatus) {
      case MintingStatus.WaitingForUserConfirmation:
        percent = 25
        break;
      case MintingStatus.SendingTransaction:
        percent = 50
        break;
      case MintingStatus.WaitingConfirmation:
        percent = 75
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
      case MintingStatus.WaitingForUserConfirmation:
      case MintingStatus.SendingTransaction:
      case MintingStatus.WaitingConfirmation:
        content = {
          type: ModalType.Waiting,
          content: (
            <div style={{ width: "100%" }}>
              <p>You are going to love this new Trait my friend.</p>
              <p>Bear with me while I get that for you...</p>
              <br />
              <Progress percent={getProgressPercentage()} active color="green">{mintingStatus}...</Progress>
              <br />
              <p style={{ fontStyle: 'italic' }}>Please be patient, this might take up to 2 minutes.</p>
            </div>
          ),
        }
        break;

      case MintingStatus.Success:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Congratulations, the mint was successful! 🎉</p>
              <p>{`Here's your new Trait:`}</p>
              <br />
              <div className={styles.new_trait_img_container}>
                {!newTrait ? (
                  <>
                    <Dimmer active inverted>
                      <Loader size="large" active inline='centered' inverted>Loading</Loader>
                    </Dimmer>
                  </>
                ) : (
                  <div>
                    <div>
                      <Image size='small' src={newTrait.externalMetadata.image} centered className={styles.new_trait_in_modal} />
                    </div>
                    <br />
                  </div>
                )}
              </div>
              {newTrait &&
                <p>You can view it on <a href={`https://solscan.io/token/${newTrait.mint.toString()}`} target="_blank" rel="noreferrer">Solscan here</a> (it might take a few minutes to show up).</p>
              }
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
              <p>Sorry about that, it looks like Solana is acting up again.</p>
              <p>Refresh the page and try again!</p>
            </>
          ),
          onClose: handleOnResetModal
        }
    }
    setModalContent(content)
  }

  useEffect(() => {
    if (isPreMinting) {
      console.log(`[minting ${props.collection.name}] updating pre-minting status: ${preMintingStatus}`)
      getPreMintingStatus()
    } else {
      console.log(`[minting ${props.collection.name}] updating minting status: ${mintingStatus}`)
      getMintingStatus()
    }
  }, [preMintingStatus, mintingStatus, isPreMinting, newTrait])

  const handleOnMintConfirm = async () => {
    setIsPreMinting(false)
    const mint = await onMint()

    if (mint) {
      const nft = await getNFTMetadata(mint.toString(), connection)
      console.log(`[minting ${props.collection.name}] new NFT:`, nft)
      setNewTrait(nft)
    }
  }

  return (
    <>
      {cm &&
      <h3 className="h3 h-white mrg-d-34">Available: {cm.state.itemsRemaining} / {cm.state.itemsAvailable === 5993 ? 6000 : cm.state.itemsAvailable}</h3>
      }
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
    </>
  )
}

export default TraitMintintSingle