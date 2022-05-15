import { useWallet } from "@solana/wallet-adapter-react"
import { useState } from "react"
import { Spinner } from "theme-ui";

import StakingLandingPage from "./LandingPage"
import AccountPage from "./AccountView"
import useGemFarmStaking from "../../hooks/useGemFarmStaking"
import AccountCreation from "./AccountCreation"


const StakingMain = ({ gemsStaked }) => {
  const { publicKey } = useWallet()

  const [farmId, setFarmId] = useState(process.env.NEXT_PUBLIC_GEMFARM_ID || "")
  const farmState = useGemFarmStaking(farmId)

  return (
    <div style={{ marginBottom: "100px", marginLeft: "20px", marginRight: "20px" }}>
      {!publicKey ? <StakingLandingPage totalStaked={gemsStaked} /> : (
        !farmState.farmerAccount ? <Spinner /> : (
          !farmState.farmerAccount.identity ? (
            <AccountCreation farmState={farmState} />
          ) : <AccountPage farmState={farmState} />
        )
      )}
    </div>
  )
}

export default StakingMain