import type { NextPage } from "next";
import BadgeMintingMain from "../components/ceremonialHall/BadgeMintingMain";
import PageWrapper from "../components/layout/PageWrapper";
import TypingEffect from "../components/utils/TypingEffect";


const DisguiseRoom: NextPage = () => {
  return (
    <PageWrapper
      title="SLA Ceramonial Hall"
      ogImageSource="/images/Logo-7-p-500.png"
      webflowPageId="622dc4049da7133fe7db2ab3"
      webflowSandwichMenuId="2464aa90-69fb-9b33-28e5-69a60a9f4a65"
      toTopArrow={true}
    >
      <div id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-img ceremonial"><img src="../images/Group-37-1.svg" loading="lazy" alt="" className="scroll-down-img" /></div>
          <div className="agent-div"><img src="../images/Agent-icon.png" loading="lazy" alt="" className="agent-img" />
            <div className="vert-left _100 cent-mob">
              <div className="tb-32 margin-d"><strong>Agent Bigspoon</strong>: </div>
              <div id="typed" className="tb-32 typedwithcursor">
                <TypingEffect text={`Ladies and gentlemen, welcome! We are gathered here today to celebrate this Llama's unwavering loyalty. Put your hands together for this talented Agent. Thank you for contributing to our Agency.`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="blue-bg-div">
        <img src="../images/Rectangle-10.png" loading="lazy" sizes="(max-width: 991px) 99vw, 100vw" srcSet="../images/Rectangle-10-p-500.png 500w, ../images/Rectangle-10.png 1867w" alt="" className="absolute-bg" />
        <img src="../images/Vector-6.svg" loading="lazy" alt="" className="d-l-corner display-none" />
        <div className="container-m relative w-container">
          <div className="vert-cent">
            <h1 className="h2">promotions: how it works</h1>
            <div className="vert-left stretch">
              <h2 className="h3 h-white">STEP 1: MINT YOUR BADGE</h2>
              <p className="p1 p-white">Every badge has a set of requirements that need to be met before minting.
                <br />
                Select your Llama Agent from the dropdown list below to start.
              </p>
            </div>
            <div className="w-layout-grid grid-2">
              <BadgeMintingMain />
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default DisguiseRoom