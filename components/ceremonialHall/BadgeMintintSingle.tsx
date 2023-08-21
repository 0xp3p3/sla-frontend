import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useMemo, useState } from "react"
import { Wallet, web3 } from "@project-serum/anchor"
import { Progress } from "semantic-ui-react"
import useBalances from "../../hooks/useBalances"
import Button from "../common/Button"
import { SlaBadge } from "../../utils/constants"
import BasicModal, { ModalType } from "../modals/BasicModal";
import { NFT } from "../../hooks/useWalletNFTs"
import { CurrentBadgeInfo } from "../../hooks/useBadge"
import { hasAgentAlreadyMintedBadge, hasAgentReachedRequiredGradeToMint, mintBadge } from "../../utils/sla/badgeV2"


interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  size?: "small" | "large",
  confirmMessage?: string,
  keepOpenOnConfirm?: boolean,
  onClose?: () => void,
}


interface Props {
  badge: SlaBadge,
  requiredBadge: SlaBadge | null,
  selectedLlama: NFT | null,
  currentBadgeInfo: CurrentBadgeInfo,
  triggerAfterMintedAction: () => void
}


const BadgeMintingSingle = (props: Props) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { hayBalance } = useBalances()
  const { currentBadgeAccountV1, currentBadgeAccountV2, currentBadge } = props.currentBadgeInfo

  const [modalContent, setModalContent] = useState<ModalContent>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isFailure, setIsFailure] = useState(false)

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

  const reset = () => {
    // console.log(`[BadgeMintingSingle] resetting`)
    setIsSuccess(false)
    setIsFailure(false)
  }


  const refreshModalContent = () => {
    let content: ModalContent

    if (!wallet || !wallet.publicKey || !wallet.connected) {
      content = {
        type: ModalType.Info,
        content: (
          <>
            <p>Start by connecting your wallet at the top of this page.</p>
          </>
        ),
        size: "small"
      }
    }

    else if (hayBalance < props.badge.price) {
      content = {
        type: ModalType.Info,
        content: (
          <>
            <p>Looks like your wallet contains {`${hayBalance}`} $HAY.</p>
            <p>Minting {props.badge.expression} costs {props.badge.price} $HAY.</p>
          </>
        )
      }
    }

    else if (!props.selectedLlama) {
      content = {
        type: ModalType.Info,
        content: (
          <>
            <p>You have not selected an Agent.</p>
          </>
        ),
        size: "small"
      }
    }

    else if (!hasAgentReachedRequiredGradeToMint(props.badge, currentBadgeAccountV1, currentBadgeAccountV2)) {
      content = {
        type: ModalType.Info,
        content: (
          <>
            <p>Looks like your Agent currently has {!currentBadge ? 'no rank' : `rank ${currentBadge.name}`} and is thus not allowed to mint {props.badge.expression}.</p>
          </>
        )
      }
    }

    else if (hasAgentAlreadyMintedBadge(props.badge, currentBadgeAccountV2)) {
      content = {
        type: ModalType.Info,
        content: (
          <>
            <p>Looks like your Agent currently has {!currentBadge ? 'no rank' : `rank ${currentBadge.name}`} and has already minted {props.badge.expression}.</p>
          </>
        )
      }
    }

    else if (isMinting) {
      content = {
        type: ModalType.Waiting,
        content: (
          <>
            <p>{`You're minting ${props.badge.expression}.`}</p>
            <p>Make sure to confirm the transaction popping up.</p>
            <br />
            <Progress percent={50} active color="green">Minting {props.badge.expression}...</Progress>
            <br />
            <p style={{ fontStyle: 'italic' }}>Please be patient, this might take up to 2 minutes.</p>

          </>
        ),
        size: "large",
      }
    }

    else if (isSuccess) {
      content = {
        type: ModalType.Info,
        content: (
          <>
            <p>Congratulations, the mint was successful! 🎉</p>
          </>
        ),
        size: "large",
        onClose: reset,
      }
    }

    else if (isFailure) {
      content = {
        type: ModalType.Info,
        content: (
          <>
            <p>Oops, it looks like the mint failed.</p>
            <p>Sorry about that, it looks like Solana is acting up again.</p>
            <p>Refresh the page and try again!</p>
          </>
        ),
        size: "large",
        onClose: reset,
      }
    }

    else {
      content = {
        type: ModalType.Warning,
        content: (
          <>
            <p>You are about to mint {props.badge.expression}!</p>
            <p>Doing so will cost you {props.badge.price} $HAY.</p>
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
    }

    setModalContent(content)
  }

  useEffect(() => {
    // console.log('[Badge mint] refreshing modal content')
    refreshModalContent()
  }, [wallet, isMinting, isFailure, isSuccess, hayBalance, props.selectedLlama, currentBadge, currentBadgeAccountV1, currentBadgeAccountV2])

  const onMintConfirm = async () => {
    if (!wallet || !wallet.publicKey || !wallet.connected) {
      console.log(`Wallet is not connected`)
      return;
    }

    // console.log(`[Badge mint] starting to mint an Badge`)
    try {
      setIsMinting(true)
      const signature = await mintBadge(
        anchorWallet, 
        connection, 
        props.badge, 
        new web3.PublicKey(props.selectedLlama.mint)
      )
      setIsSuccess(true)
      props.triggerAfterMintedAction()
      // console.log(`[Badge mint] finished minting a Badge`)
    } catch (error: any) {
      // console.log(`[Badge mint] could not mint a Badge`)
      // console.log(error)
      setIsFailure(true)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <>
      <BasicModal
        imageSrc='images/Bigspoon.png'
        agentName="Agent Bigspoon"
        {...modalContent}
        onConfirm={onMintConfirm}
        trigger={<Button isWaiting={isMinting}>Mint {props.badge.name}</Button>}
      >
      </BasicModal>
    </>
  )
}

export default BadgeMintingSingle