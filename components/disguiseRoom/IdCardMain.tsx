import Button from "../common/Button"
import BasicModal, { ModalType } from "../modals/BasicModal"



interface ModalContent {
  type: ModalType,
  content: JSX.Element,
  size: "small" | "large",
}

const modalMessages: { [name: string]: ModalContent } = {
  moreInfo: {
    type: ModalType.Info,
    content: (
      <>
        <p>So, you want a new identity, hmm?</p>
        <p>You'll soon be able to get an ID Card (60 $HAY).</p>
        <p>ID Cards are NFTs that you can use to edit the metadata of your Llama Agent and give it a unique alias. </p>
        <p>No two Llamas can have the same name.</p>
        <p>Check out the <a href="/home#roadmap">Roadmap</a> for more details!</p>
      </>
    ),
    size: "large"
  }
}


const IdCardMain = () => {
  return (
    <>
      <div style={{display: "flex", alignItems: "center", justifyItems: "center", width: "100%", justifyContent: "center", marginTop: "70px" }}>
        <img src="images/ID-Card.png" loading="lazy" alt="" className="llama-img step-3" />
        <BasicModal 
          {...modalMessages.moreInfo}
          trigger={<Button>More Info</Button>}
        >
        </BasicModal>
        {/* <a href="#" className="button id-card-mint w-button">coming soon</a> */}
      </div>
    </>
  )
}

export default IdCardMain