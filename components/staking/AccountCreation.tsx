import { FarmState } from "../../hooks/useGemFarmStaking"


const AccountCreation = ({ farmState }: { farmState: FarmState }) => {

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
      <div style={{ width: "300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="hor-left vert-mob">
          <img src="images/Rectangle-8-1.png" loading="lazy" alt="" className="llama-img" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p className="p1">
            <strong>Agent Maken</strong>: You need a staking account to get started!
          </p>
        </div>
        <button className="button" onClick={farmState.handleInitStakingButtonClick} style={{ marginTop: "20px" }}>
          Create Account
        </button>
      </div>
    </div>
  )
}

export default AccountCreation