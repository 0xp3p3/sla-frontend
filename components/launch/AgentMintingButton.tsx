import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import BasicModal, { ModalType } from "../modals/BasicModal";
import { Grid, Menu, Progress, Segment, Message } from "semantic-ui-react"
import useBalances from "../../hooks/useBalances"
import useCandyMachine, { MintingStatus, PreMintingStatus } from "../../hooks/useCandyMachine"
import { SLA_COLLECTIONS } from "../../utils/constants"
import Button from "../common/Button"
import { getNFTMetadata } from "../../utils/nfts";
import { NFT } from "../../hooks/useWalletNFTs";
import { sleep } from "../../utils/utils";


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

  return <>{`${pad(times.days)}:${pad(times.hours)}:${pad(times.minutes)}:${pad(times.seconds)}`}</>
}

const Countdown = ({ start, end, now, noTimeDisplay }: { start: Date, end: Date, now: Date, noTimeDisplay?: boolean }) => {

  const untilStart = getCountdownTimes(now, start)
  const untilEnd = getCountdownTimes(now, end)

  return (
    <div>
      {!untilStart.passed ? (
        <>Starts in {<CountdownDisplay times={untilStart.times} />}</>
      ) : !untilEnd.passed ? (
        !noTimeDisplay ? <>Ends in {<CountdownDisplay times={untilEnd.times} />}</> : "LIVE"
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
  const presaleStart = new Date(process.env.NEXT_PUBLIC_PRESALE_START)
  const presaleEnd = new Date(process.env.NEXT_PUBLIC_PRESALE_END)
  const publicSaleStart = new Date(process.env.NEXT_PUBLIC_PUBLIC_SALE_START)
  const publicSaleEnd = new Date(process.env.NEXT_PUBLIC_PUBLIC_SALE_END)
  // const price = parseFloat(process.env.NEXT_PUBLIC_MINT_PRICE)

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPresale, setIsPresale] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const [whitelistChecked, setWhitelistChecked] = useState(false)
  const [isWhitelistUser, setIsWhitelistUser] = useState(false)
  const [whitelistSpots, setWhitelistSpots] = useState(0)
  const [isPreMinting, setIsPreMinting] = useState(true)
  const [modalContent, setModalContent] = useState<ModalContent>(null)
  const [newAgent, setNewAgent] = useState<NFT>(null)

  // Update time variables every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      // Update the current time
      setCurrentTime(new Date())

      // Check which minting phase is currently active
      const now = new Date()
      const _presale = now >= presaleStart && now <= presaleEnd
      const _public = now >= publicSaleStart && now <= publicSaleEnd
      console.log(`[minting ${collection.name}] isPresale: ${_presale}, isPublic: ${_public}`)

      setIsPresale(_presale)
      setIsPublic(_public)
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


  // Update whether the user is whitelisted if necessary
  // If there's no whitelist, set to `true`
  const fetchWhitelistStatus = async () => {
    if (isPresale && wallet.publicKey) {
      const resp = await (await (fetch(`/api/isWhitelisted/${wallet.publicKey.toBase58()}`))).json()
      console.log(`[minting ${collection.name}] whitelisted? ${resp.whitelisted}, leftToMint: ${resp.leftToMint}`)
      setIsWhitelistUser(resp.whitelisted)
      setWhitelistSpots(resp.leftToMint)
      setWhitelistChecked(true)
      if (resp.whitelisted) {
        console.log(`[minting ${collection.name}] user can still mint ${resp.leftToMint} Agents`)
      }
    } else if (isPublic) {
      setIsWhitelistUser(true)
    } else {
      setIsWhitelistUser(false)
    }
  }

  // Fetch whitelist status when ready to mint
  useEffect(() => {
    if (preMintingStatus === PreMintingStatus.Ready) {
      console.log(`[minting ${collection.name}] Fetching whitelist status`)
      fetchWhitelistStatus()
    }
  }, [preMintingStatus])


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
              <p>Doing so will cost you ${cm ? cm.state.price : '0.75'} SOL.</p>
              {isPresale &&
                <p>{`You still have ${whitelistSpots} spot(s) on the whitelist.`}</p>
              }
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

    // Special case when people are not on the whitelist during presale
    if (isPresale && preMintingStatus === PreMintingStatus.Ready) {
      if (!whitelistChecked) {
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Bear with me while I check the whitelist.</p>
            </>
          )
        }
      } else if (!isWhitelistUser) {
        content = {
          type: ModalType.Info,
          content: (
            <>
              <p>Your wallet does not appear to be on the whitelist.</p>
              <p>Check the countdown and come back for the public mint!</p>
            </>
          )
        }
      }
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

  const getMintingStatus = async () => {
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
        if (!newAgent) { await sleep(1000) }
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
              <p>Close this and try again!</p>
            </>
          ),
          onClose: handleOnResetModal
        }
    }
    setModalContent(content)
  }


  const handleOnResetModal = () => {
    setIsPreMinting(true)
    setNewAgent(null)
  }

  useEffect(() => {
    if (isPreMinting) {
      console.log(`[minting ${collection.name}] updating pre-minting status: ${preMintingStatus}`)
      getPreMintingStatus()
    } else {
      console.log(`[minting ${collection.name}] updating minting status: ${mintingStatus}`)
      getMintingStatus()
    }
  }, [preMintingStatus, mintingStatus, isPreMinting, newAgent, isWhitelistUser, whitelistSpots, whitelistChecked])


  // Handler for minting
  const handleOnMintConfirm = async () => {
    setIsPreMinting(false)

    const mint = await onMint()

    if (mint) {
      if (isPresale) {
        const resp = await (await (fetch(`/api/isWhitelisted/${wallet.publicKey.toBase58()}`))).json()
        if (!resp?.whitelisted) {
          console.log(`Cannot mint because user is not whitelisted`)
          return
        }
      }

      const nft = await getNFTMetadata(mint.toString(), connection)
      console.log(`[minting ${collection.name}] new NFT:`, nft)
      setNewAgent(nft)

      // Update the whitelist after minting
      if (isPresale) {
        await fetch(`/api/mintAgent/${wallet.publicKey.toBase58()}`)
        fetchWhitelistStatus()
      }
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
                    <Countdown start={publicSaleStart} end={publicSaleEnd} now={currentTime} noTimeDisplay />
                  </Menu.Item>
                </Menu>
              </Grid.Column>
            </Grid.Row>
            {cm &&
              <Grid.Row columns={1} style={{ marginBottom: "50px" }}>
                <Grid.Column textAlign="center">
                  <Message warning color="red" size="big" compact style={{marginBottom: "50px" }}>
                    <Message.Header>PLEASE NOTE</Message.Header>
                    <p>All royalties will be set to 90% until mint is complete.</p>
                  </Message>
                  <Progress
                    value={itemsRedeemed}
                    total={cm.state.itemsAvailable}
                    active={isPresale || isPublic}
                    size="medium"
                    inverted
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
                {cm &&
                  <BasicModal
                    content={modalContent}
                    onConfirm={handleOnMintConfirm}
                    imageSrc="images/nasr.png"
                    {...modalContent}
                    trigger={(
                      <Button style={{ margin: "auto" }} isWaiting={isMinting}>
                        {`Mint (${cm ? cm.state.price : '0.75'} SOL)`}
                      </Button>
                    )}>
                  </BasicModal>
                }
                <p className="mint-comment" style={{ fontStyle: "normal" }}>33% of the mint fund will go to the community wallet.</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    </>
  )
}

export default AgentMintingButton
