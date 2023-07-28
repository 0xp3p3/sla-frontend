import { useEffect, useState } from "react"
import { Container, Image, Message } from "semantic-ui-react"
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
      // console.log('Failed to create an account', error)
    } finally {
      setWaiting(false)
    }
  }

  return (
    <div >
      <Container textAlign="center">
        <div className="hor-left vert-mob" style={{marginTop: "30px"}}>
          <Image src="images/agent_stacy.png" className="llama-img" centered />
        </div>
        <Message color="red" compact>
          <Message.Header>AGENT STACY - STAKING UPDATE</Message.Header>
          <p>Our new staking platform <a href="https://staking.secretllamaagency.com" target="_blank" rel="noreferrer">is live here</a>. </p>
          <p>Please migrate all your Secret Agents over to the new platform as soon as possible.</p>
          <p>The old platform will be removed soon. </p>
        </Message>
      </Container>
    </div>
  )
}

export default AccountCreation