import { useEffect, useState } from "react"
import { Spinner } from "theme-ui"
import { FarmState } from "../../hooks/useGemFarmStaking"


const AccountCreation = ({ farmState }: { farmState: FarmState }) => {

  const [waiting, setWaiting] = useState(false)

  const initStakingAccount = async () => {
    try {
      setWaiting(true)
      await farmState.handleInitStakingButtonClick()
      await farmState.handleRefreshRewardsButtonClick()
    } catch (error: any) {
      console.log('Failed to create an account', error)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "80px" }}>
      <div style={{ width: "300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="hor-left vert-mob">
          <img src="images/agent_stacy.png" loading="lazy" alt="" className="llama-img" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p className="p1">
            <strong>Agent Stacy</strong>: You need a staking account to get started!
          </p>
        </div>
        <button className="button" onClick={initStakingAccount} style={{ marginTop: "20px" }}>
          {waiting ? <Spinner /> : "Create Account"}
        </button>
      </div>
    </div>
  )
}

export default AccountCreation