import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { Grid, Menu, Progress, Segment } from "semantic-ui-react"
import { ModalType } from "../modals/BasicModal";
import useBalances from "../../hooks/useBalances"
import useCandyMachine, { MintingStatus, PreMintingStatus } from "../../hooks/useCandyMachine"
import { SLA_COLLECTIONS } from "../../utils/constants"
import Button from "../common/Button"
import { getNFTMetadata } from "../../utils/nfts";
import {
  findGatewayToken,
  getGatewayTokenAddressForOwnerAndGatekeeperNetwork,
  onGatewayTokenChange,
  removeAccountChangeListener,
} from '@identity.com/solana-gateway-ts';


interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  size?: "small" | "large",
  confirmMessage?: string,
  keepOpenOnConfirm?: boolean,
  onClose?: () => void,
}


interface TimeCountdown {
  days: number,
  hours: number,
  minutes: number,
  seconds: number,
}


const getCountdownTimes = (now: Date, target: Date): { times: TimeCountdown, passed: boolean } => {

  const left = Math.max(0, target.getTime() - now.getTime())

  return {
    times: {
      days: Math.floor(left / (1000 * 60 * 60 * 24)),
      hours: Math.floor((left / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((left / 1000 / 60) % 60),
      seconds: Math.floor((left / 1000) % 60),
    },
    passed: left === 0
  }
}

const CountdownDisplay = ({ times }: { times: TimeCountdown }) => {
  const pad = (n) => n < 10 ? `0${n}` : n;

  return <>{`${pad(times.hours)}:${pad(times.minutes)}:${pad(times.seconds)}`}</>
}

const Countdown = ({ start, end, now }: { start: Date, end: Date, now: Date }) => {

  const untilStart = getCountdownTimes(now, start)
  const untilEnd = getCountdownTimes(now, end)

  return (
    <div>
      {!untilStart.passed ? (
        <>Starts in {<CountdownDisplay times={untilStart.times} />}</>
      ) : !untilEnd.passed ? (
        <>Ends in {<CountdownDisplay times={untilEnd.times} />}</>
      ) : <>Finished</>}
    </div>
  )
}


const AgentMintingButton = () => {
  const collection = SLA_COLLECTIONS.agent

  const { connection } = useConnection()
  const wallet = useWallet()
  const { solBalance } = useBalances()
  const {
    isMinting,
    onMint,
    preMintingStatus,
    mintingStatus,
    refreshState,
    cm,
  } = useCandyMachine(collection, solBalance)

  // Extract important times from environment variables
  const presaleStart = new Date("09 Jun 2022 17:00:00 UTC")
  const presaleEnd = new Date("09 Jun 2022 20:00:00 UTC")
  const publicSaleStart = new Date("09 Jun 2022 20:00:00 UTC")
  const publicSaleEnd = new Date("15 Jun 2022 23:59:00 UTC")

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPresale, setIsPresale] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const [isPreMinting, setIsPreMinting] = useState(true)
  const [modalContent, setModalContent] = useState<ModalContent>(null)

  const [verified, setVerified] = useState(false);
  const [webSocketSubscriptionId, setWebSocketSubscriptionId] = useState(-1);
  const [clicked, setClicked] = useState(false);


  // Update time variables every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      // Update the current time
      setCurrentTime(new Date())

      // Check which minting phase is currently active
      const now = new Date()
      setIsPresale(now >= presaleStart && now <= presaleEnd)
      setIsPublic(now >= publicSaleStart && now <= publicSaleEnd)
    }, 1000)

    return () => clearInterval(timer)
  }, [])


  // Fetch the candy machine state at regular interval
  const [lastRefresh, setLastRefresh] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      if (now >= presaleStart && now <= publicSaleEnd) {
        refreshState().then(() => setLastRefresh(new Date()))
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [])


  // Update the number of items redeemed on cm state refresh, only if past the go-live time
  const [itemsRedeemed, setItemsRedeemed] = useState(0)
  useEffect(() => {
    if (cm) {
      setItemsRedeemed(currentTime > presaleStart ? cm.state.itemsRedeemed : 0)
    }
  }, [cm])


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
              <p>It looks like something went wrong when fetching the {collection.name} collection.</p>
              <p>Please refresh the page and try again.</p>
            </>
          )
        }
        break;

      case PreMintingStatus.NotLiveYet:
        content = {
          type: ModalType.Info,
          content: (
            <p>Llama Agents cannot be minted at this time.</p>
          ),
          size: "small"
        }
        break;

      case PreMintingStatus.BalanceTooSmall:
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Looks like your wallet contains {`${solBalance.toFixed(2)}`} SOL.</p>
              <p>Minting a new Llama Agent costs 1.5 SOL.</p>
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
              <p>Doing so will cost you 1.5 SOL.</p>
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
              <p>{`Here's your new Llama Agent:`}</p>
              <br />
              {/* <div className={styles.new_trait_img_container}>
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
              } */}
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


  const handleOnResetModal = () => {
    setIsPreMinting(true)
  }

  useEffect(() => {
    if (isPreMinting) {
      console.log(`[minting ${collection.name}] updating pre-minting status: ${preMintingStatus}`)
      getPreMintingStatus()
    } else {
      console.log(`[minting ${collection.name}] updating minting status: ${mintingStatus}`)
      getMintingStatus()
    }
  }, [preMintingStatus, mintingStatus, isPreMinting])


  useEffect(() => {
    const mint = async () => {
      await removeAccountChangeListener(
        connection,
        webSocketSubscriptionId,
      )
      await _onMint()

      setClicked(false);
      setVerified(false);
    }

    if (verified && clicked) {
      console.log(`[cm hook] minting after detecting a gateway verification`)
      mint();
    }

  }, [
    verified,
    clicked,
    connection,
    webSocketSubscriptionId,
  ])

  // Handler for minting
  const handleOnMintConfirm = async () => {
    setIsPreMinting(false)
    setClicked(true)

    // Request a gatekeeper token if necessary
    if (cm.state.gatekeeper) {
      console.log('[cm hook] Requesting a gatekeeper token before minting')

      const network = cm.state.gatekeeper.gatekeeperNetwork.toBase58()
      if (network === 'tibePmPaoTgrs929rWpu755EXaxC7M3SthVCf6GzjZt') {
        const gatewayToken = await findGatewayToken(
          connection,
          wallet.publicKey,
          cm.state.gatekeeper.gatekeeperNetwork,
        )

        if (gatewayToken?.isValid()) {
          console.log(`[cm hook] gateway token already valid`)
          await _onMint()
        } else {
          window.open(`https://verify.encore.fans/?gkNetwork=${network}`, '_blank')

          const gatewayTokenAddress =
            await getGatewayTokenAddressForOwnerAndGatekeeperNetwork(
              wallet.publicKey!,
              cm.state.gatekeeper.gatekeeperNetwork,
            )

          setWebSocketSubscriptionId(
            onGatewayTokenChange(
              connection,
              gatewayTokenAddress,
              () => setVerified(true),
              'confirmed',
            ),
          )
        }
      } else {
        console.log(`[cm hook] Unknown Gatekeeper Network: ${network}`)
      }
    } else {
      console.log(`[cm hook] gateway token not needed`)
      await _onMint()
    }
    setClicked(false)
  }

  const _onMint = async () => {
    const mint = await onMint()

    if (mint) {
      const nft = await getNFTMetadata(mint.toString(), connection)
      console.log(`[minting ${collection.name}] new NFT:`, nft)
    }
  }

  return (
    <>
      <div style={{ marginBottom: "10px", marginTop: "20px", display: "flex", justifyContent: "center" }}>
        <Segment inverted style={{ maxWidth: "700px" }}>
          <Grid padded stackable style={{ gridRowGap: "20px" }}>
            <Grid.Row columns={2}>
              <Grid.Column textAlign="center">
                <Menu vertical style={{ margin: "auto" }}>
                  <Menu.Item className="header">Whitelist Mint</Menu.Item>
                  <Menu.Item>
                    <Countdown start={presaleStart} end={presaleEnd} now={currentTime} />
                  </Menu.Item>
                </Menu>
              </Grid.Column>
              <Grid.Column textAlign="center">
                <Menu vertical style={{ margin: "auto" }}>
                  <Menu.Item className="header">Public Mint</Menu.Item>
                  <Menu.Item>
                    <Countdown start={publicSaleStart} end={publicSaleEnd} now={currentTime} />
                  </Menu.Item>
                </Menu>
              </Grid.Column>
            </Grid.Row>
            {cm &&
              <Grid.Row columns={1} style={{ marginBottom: "50px" }}>
                <Grid.Column>
                  <Progress
                    value={itemsRedeemed}
                    total={cm.state.itemsAvailable}
                    active={isPresale || isPublic}
                    size="medium"
                    inverted
                    // disabled={!isPresale && !isPublic}
                    color="green"
                    style={{ width: "70.8%", margin: "auto" }}
                  >
                    <div style={{ marginTop: "10px" }}>
                      <p style={{ fontSize: "22px" }}>{`Minted: ${itemsRedeemed} / ${cm.state.itemsAvailable}`}</p>
                      <p>{`(Last refresh: ${lastRefresh.toLocaleTimeString()})`}</p>
                    </div>
                  </Progress>
                </Grid.Column>
              </Grid.Row>
            }
            <Grid.Row columns={1} style={{ marginTop: "10px" }}>
              <Grid.Column>
                {cm?.state.gatekeeper &&
                  //   <BasicModal
                  //   content={modalContent}
                  //   onConfirm={handleOnMintConfirm}
                  //   imageSrc="images/rectangle-8-1.png"
                  //   {...modalContent}
                  //   trigger={(
                  //     <Button style={{ margin: "auto" }} isWaiting={isMinting}>
                  //       {`Mint (1.5 SOL)`}
                  //     </Button>
                  //   )}>
                  // </BasicModal>
                  <Button style={{ margin: "auto" }} isWaiting={isMinting} onClick={handleOnMintConfirm}>
                    {`Mint (1.5 SOL)`}
                  </Button>
                }
                <p className="mint-comment" style={{ fontStyle: 'italic', marginBottom: "10px" }}>33% will go to the community wallet.</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    </>
  )

}

export default AgentMintingButton
