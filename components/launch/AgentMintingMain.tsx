import { useEffect, useState } from "react"
import { Grid, Menu, Progress, Segment, Message } from "semantic-ui-react"
import useBalances from "../../hooks/useBalances"
import useCandyMachine from "../../hooks/useCandyMachine"
import { SLA_COLLECTIONS } from "../../utils/constants"
import AgentMintingButton from "./AgentMintingButton";


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


const AgentMintingMain = () => {
  const collection = SLA_COLLECTIONS.agent
  const { solBalance } = useBalances()

  const candyMachine = useCandyMachine(collection, solBalance)
  const { cm } = candyMachine

  // Extract important times from environment variables
  const presaleStart = new Date(process.env.NEXT_PUBLIC_PRESALE_START)
  const presaleEnd = new Date(process.env.NEXT_PUBLIC_PRESALE_END)
  const publicSaleStart = new Date(process.env.NEXT_PUBLIC_PUBLIC_SALE_START)
  const publicSaleEnd = new Date(process.env.NEXT_PUBLIC_PUBLIC_SALE_END)

  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPresale, setIsPresale] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

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
      candyMachine.refreshState().then(() => setLastRefresh(new Date()))
    }, 60000)
    return () => clearInterval(timer)
  }, [])


  // Update the number of items redeemed on cm state refresh, only if past the go-live time
  const [itemsRedeemed, setItemsRedeemed] = useState(null)
  const refreshItemsRedeemed = async () => {
    if (cm) {
      // Check how many airdrops have been collected
      const resp = await (await (fetch(`/api/airdrop/getAirdropMinted/`))).json()
      if (resp.total === undefined || resp?.error) {
        console.log(`an error occurred while fetching number of airdrops`)
      } else {
        const redeemed = cm.state.itemsRedeemed + 1000 - resp.total
        setItemsRedeemed(redeemed)
      }
    }
  }

  useEffect(() => {
    refreshItemsRedeemed()
  }, [cm])

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

            <Grid.Row columns={1} style={{ marginBottom: "50px" }}>
              <Grid.Column textAlign="center">
                <Message warning color="red" size="big" compact style={{ marginBottom: "50px" }}>
                  <Message.Header>PLEASE NOTE</Message.Header>
                  <p>All royalties will be set to 90% until mint is complete.</p>
                </Message>
                {(cm && itemsRedeemed) &&
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
                }
              </Grid.Column>
            </Grid.Row>

            <Grid.Row columns={1} style={{ marginTop: "10px" }}>
              <Grid.Column>
                {cm && (
                  <AgentMintingButton
                    collection={SLA_COLLECTIONS.agent}
                    candyMachine={candyMachine}
                    solBalance={solBalance}
                  />
                )}
                <p className="mint-comment" style={{ fontStyle: "normal" }}>33% of the mint fund will go to the community wallet.</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    </>
  )
}

export default AgentMintingMain
