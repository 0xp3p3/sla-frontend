import { useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { Progress } from "semantic-ui-react"
import { CandyMachine, MintingStatus, PreMintingStatus } from "../../hooks/useCandyMachine"
import { NFT } from "../../hooks/useWalletNFTs"
import { SlaCollection } from "../../utils/constants"
import { getNFTMetadata } from "../../utils/nfts"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal";


interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  size?: "small" | "large",
  confirmMessage?: string,
  keepOpenOnConfirm?: boolean,
  onClose?: () => void,
}


interface Props {
  candyMachine: CandyMachine,
  collection: SlaCollection,
  solBalance: number,
}


const AgentMintingButton = (props: Props) => {
  const { connection } = useConnection()
  const {
    isMinting,
    onMint,
    preMintingStatus,
    mintingStatus,
    cm,
    isUserWhitelisted,
    discountPrice,
  } = props.candyMachine

  const [modalContent, setModalContent] = useState<ModalContent>(null)
  const [isPreMinting, setIsPreMinting] = useState(true)
  const [newAgent, setNewAgent] = useState<NFT>(null)

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
              <p>Llama Agents cannot be minted at this time.</p>
            </>
          )
        }
        break;

      case PreMintingStatus.BalanceTooSmall:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Looks like your wallet contains {`${props.solBalance.toFixed(2)}`} SOL.</p>
              <p>Minting a new Llama Agent costs {cm ? cm.state.price : '0.75'} SOL.</p>
            </>
          )
        }
        break;

      case PreMintingStatus.Ready:
        content = {
          type: ModalType.Warning,
          content: (
            <>
              <p>You are about to mint a Secret Llama Agent!</p>
              {(isUserWhitelisted && discountPrice <= 0.0001) ? (
                <p>Looks like you're eligible for a free Secret Agent!</p>
              ) : (
                <p>Doing so will cost you {cm ? cm.state.price : '0.75'} SOL.</p>
              )}
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
    setNewAgent(null)
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
              <p style={{ fontStyle: 'italic' }}>Please be patient, this might take up to 2 minutes.</p>
              <br />
              <Progress percent={getProgressPercentage()} active color="green">{mintingStatus}...</Progress>
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
              <br />
              {newAgent &&
                <p>You can view it on <a href={`https://solscan.io/token/${newAgent.mint.toString()}`} target="_blank" rel="noreferrer">Solscan here</a> (it might take a few minutes to show up).</p>
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
  }, [preMintingStatus, mintingStatus, isPreMinting, newAgent])

  const handleOnMintConfirm = async (isWhitelistMint: boolean) => {
    setIsPreMinting(false)
    const mint = await onMint()

    if (mint) {
      const nft = await getNFTMetadata(mint.toString(), connection)
      console.log(`[minting ${props.collection.name}] new NFT:`, nft)
      setNewAgent(nft)

      // Update the whitelist after minting
      if (isWhitelistMint) {
        await fetch(`/api/airdrop/recordAirdropMint}`)
      }
    }
  }

  return (
    <>
      <BasicModal
        content={modalContent}
        onConfirm={() => handleOnMintConfirm(isUserWhitelisted)}
        imageSrc="images/nasr.png"
        {...modalContent}
        trigger={(
          <Button style={{ margin: "auto", width: (isUserWhitelisted && discountPrice) ? "300px" : "220px" }} isWaiting={isMinting}>
            {`Mint (${cm ? ((isUserWhitelisted && discountPrice) ? 'FREE AIRDROP' : cm.state.price + ' SOL' ) : '0.75 SOL'})`}
          </Button>
        )}
      >
      </BasicModal>
    </>
  )
}

export default AgentMintingButton