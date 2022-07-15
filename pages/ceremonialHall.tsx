import type { NextPage } from "next";
import Button from "../components/common/Button";
import CombineMain from "../components/disguiseRoom/CombineMain";
import IdCardMain from "../components/disguiseRoom/IdCardMain";
import TraitMingintMain from "../components/disguiseRoom/TraitMintingMain";
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
                {/* Select your Llama Agent from the dropdown list below to start. */}
              </p>
            </div>
            <div className="w-layout-grid grid-2">
              <div data-hover="false" data-delay="0" id="w-node-a1dee6d1-44bf-c50b-bb66-ed0b8ee6182e-e7db2ab3" data-w-id="a1dee6d1-44bf-c50b-bb66-ed0b8ee6182e" className="dropdown-2 w-dropdown">


                <nav className="dropdown-list-2 w-dropdown-list">
                  <a href="#" className="dd-link w-inline-block"><img src="../images/Agent-icon.png" loading="lazy" alt="" className="llama-select-img" />
                    <div>AGENT BIGSPOON</div>
                  </a>
                  <a href="#" className="dd-link y-bg w-inline-block"><img src="../images/Rectangle-56.png" loading="lazy" alt="" className="llama-select-img" />
                    <div>AGENT BIGSPOON</div>
                  </a>
                  <a href="#" className="dd-link w-inline-block"><img src="../images/Rectangle-55.png" loading="lazy" alt="" className="llama-select-img" />
                    <div>AGENT BIGSPOON</div>
                  </a>
                  <a href="#" className="dd-link y-bg w-inline-block"><img src="../images/Rectangle-52.png" loading="lazy" alt="" className="llama-select-img" />
                    <div>AGENT BIGSPOON</div>
                  </a>
                </nav>
              </div>
              <div id="w-node-_6deb578f-cd05-514c-f1dc-26a916b82dda-e7db2ab3"></div>
              <div id="w-node-b99ca53e-a80f-5bae-8c89-3e1aaa79d07d-e7db2ab3" className="none-mob"></div>
              <div id="w-node-_1e5206db-e4c0-6d6c-91fd-4943b60221eb-e7db2ab3" className="vert-left space-btw h-700">
                <div className="vert-left marg-mob">
                  <img src="../images/Bronze.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Bronze-p-500.png 500w, ../images/Bronze-p-800.png 800w, ../images/Bronze.png 1000w" alt="" className="llama-img select" />
                  <h3 className="h3 h-white mrg-d-34">3,000 Supply<br />+5 bonus $HAY</h3>
                  <div className="p1 p-white">Requirement:<br />- 60 $HAY</div>
                </div>
                <Button className="mint-badge" disabled>Mint Bronze</Button>
              </div>
              <div id="w-node-_18afe3ea-d09d-a4a9-d75b-940fffa9d6df-e7db2ab3" className="vert-left space-btw h-700">
                <div className="vert-left marg-mob">
                  <img src="../images/Silver.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Silver-p-500.png 500w, ../images/Silver-p-800.png 800w, ../images/Silver.png 1000w" alt="" className="llama-img select" />
                  <h3 className="h3 h-white mrg-d-34">2,100 Supply<br />+7 Bonus $HAY</h3>
                  <div className="p1 p-white">Requirement:<br />- 150 $HAY<br />- Must have a Bronze Ranked Llama agent</div>
                </div>
                <Button className="mint-badge" disabled>Mint Silver</Button>
              </div>
              <div id="w-node-_82f835ae-4110-40a3-fcac-b2b115de4b1c-e7db2ab3" className="vert-left space-btw h-700">
                <div className="vert-left marg-mob">
                  <img src="../images/Gold.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Gold-p-500.png 500w, ../images/Gold-p-800.png 800w, ../images/Gold.png 1000w" alt="" className="llama-img select" />
                  <h3 className="h3 h-white mrg-d-34">1,350 Supply<br />+9 Bonus $HAY</h3>
                  <div className="p1 p-white">Requirement:<br />- 210 $HAY<br />- Must have a Silver Ranked Llama Agent</div>
                </div>
                <Button className="mint-badge" disabled>Mint Gold</Button>
              </div>
              <div id="w-node-_5d0b1d89-fa1c-6041-1a9c-2c99ee13eb02-e7db2ab3" className="vert-left space-btw h-700">
                <div className="vert-left marg-mob">
                  <img src="../images/Platinum.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Platinum-p-500.png 500w, ../images/Platinum-p-800.png 800w, ../images/Platinum.png 1000w" alt="" className="llama-img select" />
                  <h3 className="h3 h-white mrg-d-34">750 Supply<br />+11 Bonus $HAY</h3>
                  <div className="p1 p-white">Requirement:<br />- 405 $HAY<br />- Must have a Gold Ranked Llama Agent</div>
                </div>
                <Button className="mint-badge" disabled>Mint Platinum</Button>
              </div>
              <div id="w-node-b3720fa6-9655-bf96-17d8-a8304b6f5463-e7db2ab3" className="vert-left space-btw h-700">
                <div className="vert-left marg-mob">
                  <img src="../images/Diamond.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Diamond-p-500.png 500w, ../images/Diamond-p-800.png 800w, ../images/Diamond.png 1000w" alt="" className="llama-img select" />
                  <h3 className="h3 h-white mrg-d-34">300 Supply<br />+15 Bonus $HAY</h3>
                  <div className="p1 p-white">Requirement:<br />- 660 $HAY<br />- Must have a Platinum Ranked Llama Agent</div>
                </div>
                <Button className="mint-badge" disabled>Mint Diamond</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default DisguiseRoom