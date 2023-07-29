import { Container, Message } from "semantic-ui-react"
import ConnectWallet from "../wallet/ConnectWallet"
import SummaryItem from "./SummaryItem"


const SummaryRow = ({ totalStaked }: { totalStaked: number }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-evenly", columnGap: "30px", flexWrap: "wrap", marginBottom: "40px" }}>
      <SummaryItem title="Total Agents Staked" value={`${totalStaked}`} />
      <SummaryItem title="% of Agents Staked" value={`${(totalStaked * 100 / 6000).toFixed(3)} %`} />
      {/* <SummaryItem title="Minimum Value Locked" value="$xx,xxx,xxx" /> */}
    </div>
  )
}

const Title = () => {
  return (
    <h1 className="h1-small" style={{ marginTop: "50px", marginBottom: "20px" }}>
      Llama Agents Staking
    </h1>
  )
}


const StakingLandingPage = ({ totalStaked }: { totalStaked: number }) => {

  return (
    <div>
      <Container textAlign="center">
        <Title />
        <Message color="red" compact>
          <Message.Header>STAKING UPDATE</Message.Header>
          <p>Our new staking platform <a href="https://staking.secretllamaagency.com" target="_blank" rel="noreferrer">is live here</a>. </p>
          <p>Please migrate all your Secret Agents over to the new platform as soon as possible.</p>
          <p>The old platform will be removed soon. </p>
        </Message>
        <Message compact>
          <Message.Content>
            To unstake your Secret Agents from the old platform, connect your wallet below.
          </Message.Content>
        </Message>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ConnectWallet className="button blue" />
        </div>
      </Container>
    </div>
  )
}

export default StakingLandingPage