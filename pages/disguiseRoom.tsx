import type { NextPage } from "next";
import CombineMain from "../components/disguiseRoom/CombineMain";
import IdCardMain from "../components/disguiseRoom/IdCardMain";
import TraitMingintMain from "../components/disguiseRoom/TraitMintingMain";
import PageWrapper from "../components/layout/PageWrapper";
import TypingEffect from "../components/utils/TypingEffect";


const DisguiseRoom: NextPage = () => {
  return (
    <PageWrapper 
      title="SLA Disguise Room" 
      ogImageSource="/images/Logo-7-p-500.png" 
      webflowPageId="622dfe66d1256c4dfaba1442" 
      webflowSandwichMenuId="7db65d3f-0335-cb2e-4fb0-d844ff729209"
      toTopArrow={true}
    >
      <div id="hero" className="hero-section">
        <div className="hero-content">
          <div className="hero-img disguise"><img src="images/Group-37-1.svg" loading="lazy" alt="" className="scroll-down-img moveArrow" /></div>
          <div className="agent-div d"><img src="images/Agent-icon-2.png" loading="lazy" sizes="(max-width: 767px) 120px, (max-width: 991px) 140px, 200px" srcSet="images/Agent-icon-2-p-500.png 500w, images/Agent-icon-2.png 764w" alt="" className="agent-img" />
            <div className="vert-left _100 cent-mob">
              <div className="tb-32 margin-d"><strong>Agent Franz</strong>: </div>
              <div id="typed" className="tb-32 typedwithcursor">
                <TypingEffect text={`Welcome, new recruit! Let's get you in proper disguise. I've developed new pieces of technology called traits that permanently alter your appearance. Grab yourself one of each and put them on to complete your look.`} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="blue-bg-div"><img src="images/Rectangle-10.png" loading="lazy" sizes="(max-width: 991px) 99vw, 100vw" srcSet="images/Rectangle-10-p-500.png 500w, images/Rectangle-10.png 1867w" alt="" className="absolute-bg" /><img src="images/Vector-6.svg" loading="lazy" alt="" className="d-l-corner display-none" />
        <div className="container-m relative w-container">
          <div className="vert-cent">
            <h1 className="h2">How it works</h1>
            <div className="vert-left stretch">
              <h2 className="h3 h-white">STEP 1: MINT YOUR TRAITS</h2>
              <p className="p1 p-white">There are 5 trait categories: Eyes, Mouth, Skin, Clothing and Hats. Each category is its own collection and will generate a random trait when you mint from it.<br/><br/> Combining a trait with your Llama Agent is permanent, making all collections deflationary.<br/><br/> Each trait costs 2 $HAY. </p>
            </div>
            <TraitMingintMain />
          </div>
        </div>
      </div>
      <div className="step-2">
        <img src="images/Rectangle-10.png" loading="lazy" sizes="(max-width: 991px) 99vw, 100vw" srcSet="images/Rectangle-10-p-500.png 500w, images/Rectangle-10.png 1867w" alt="" className="absolute-bg" />
        <div className="container-m relative w-container">
          <div className="vert-cent">
            <div className="vert-left stretch">
              <h2 className="h3">STEP 2: COMBINE</h2>
              <p className="p1">
                In this section, you&apos;ll be able to combine your traits with your Llama Agent. Any trait combinations completed here will be permanent.
                <br /><br />
                Once you&apos;ve selected the Llama Agent and trait you&apos;d like to combine from the dropdown menus, we&apos;ll generate a preview of what the resulting Agent would look like.
                Once you&apos;re happy with your new look, click the &apos;combine&apos; button and follow Agent Franz&apos; instructions. 
                <br /><br />
                Repeat these steps for every trait to complete your disguise.</p>
            </div>
            <CombineMain />
          </div>
        </div>
      </div>
      <div className="blue-bg-div"><img src="images/Vector-4.svg" loading="lazy" alt="" className="d-r-corner" /><img src="images/Rectangle-10.png" loading="lazy" sizes="(max-width: 991px) 99vw, 100vw" srcSet="images/Rectangle-10-p-500.png 500w, images/Rectangle-10.png 1867w" alt="" className="absolute-bg" />
        <div className="container-m relative w-container">
          <div className="vert-left">
            <h3 className="h3 h-white">step 3: mint your id card</h3>
            <p className="p1 p-white">
              So, you want a new identity, hmm?
              <br/><br/>
              {`You're now able to get an ID Card: a token you can use to edit the metadata of your Llama Agent and give it a unique alias!`}
              <br/><br/>
              No two Llamas can have the same name.
              <br/><br/>
              ID Cards cost 60 $HAY each.
            </p>
            <IdCardMain />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default DisguiseRoom