import { useEffect, useState } from "react"
import { FarmState } from "../../hooks/useGemFarmStaking"
import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"



interface ModalContent {
  type: ModalType,
  content: JSX.Element,
}




const AccountCreation = ({ farmState }: { farmState: FarmState }) => {

  const [waiting, setWaiting] = useState(false)
  const [modal, setModal] = useState<ModalContent>(null)


  const initStakingAccount = async () => {
    try {
      setWaiting(true)
      await farmState.handleInitStakingButtonClick()
    } catch (error: any) {
      console.log('Failed to create an account', error)
    } finally {
      setWaiting(false)
    }
  }

  useEffect(() => {

    let content: ModalContent
    if (waiting) {
      content = {
        type: ModalType.Waiting,
        content: (
          <>
            <p>Let's create a new staking account for you so you can stake your Llama Agent and generate some $HAY.</p>
            <p>To proceed, you'll have to approuve the transaction popping up in your wallet. I'll handle the rest!</p>
            <br />
            <p>Solana has been rather congested lately. If this transaction fails, simply refresh the page and try again!</p>
          </>
        )
      }
    }

  }, [waiting])




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
        <BasicModal
          type={ModalType.Waiting}
          content={ }
          trigger={(
            <Button className="button" isWaiting={waiting}>
              {"Create Account"}
            </Button>
          )}
        >
        </BasicModal>
      </div>
    </div>
  )
}

export default AccountCreation