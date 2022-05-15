import ConnectWallet from "../wallet/ConnectWallet"
import SummaryItem from "./SummaryItem"


const SummaryRow = ({ totalStaked }: { totalStaked: number }) => {
  return (
    <div style={{display: "flex", justifyContent: "space-evenly", columnGap: "30px", flexWrap: "wrap", marginBottom: "40px"}}>
      <SummaryItem title="Total Agents Staked" value={`${totalStaked}`} />
      <SummaryItem title="% of Agents Staked" value={`${(totalStaked * 100 / 6000).toFixed(3)} %`} />
      {/* <SummaryItem title="Minimum Value Locked" value="$xx,xxx,xxx" /> */}
    </div>
  )
}

const Title = () => {
  return (
    <h1 className="h1-small" style={{marginTop: "50px", marginBottom: "50px"}}>
      Llama Agents Staking
    </h1>
  )
}


const StakingLandingPage = ({ totalStaked }: { totalStaked: number }) => {

  return (
    <div style={{display: "flex", flexDirection: "column", textAlign: "center"}}>
      <Title />
      <SummaryRow totalStaked={totalStaked} />
      <div style={{display: "flex", justifyContent: "center"}}>
        <ConnectWallet className="button blue" />
      </div>
    </div>
  )
}

export default StakingLandingPage