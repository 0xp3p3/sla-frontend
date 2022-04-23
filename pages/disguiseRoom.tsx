import type { NextPage } from "next";
import PageWrapper from "../components/layout/PageWrapper";
import AgentSelectionDropdown from "../components/utils/AgentSelectionDropdown";
import TraitSelectionDropdown from "../components/utils/TraitSelectionDropdown";
import TypingEffect from "../components/utils/TypingEffect";


const DisguiseRoom: NextPage = () => {
  return (
    <PageWrapper title="The Disguise Room" webflowPageId="622dfe66d1256c4dfaba1442" webflowSandwichMenuId="7db65d3f-0335-cb2e-4fb0-d844ff729209">
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
              <p className="p1 p-white">There are 5 trait categories: Eyes, Mouth, Skin, Clothing and Hats. Each category is its own collection and will generate a random trait when you mint from it.<br/><br/> Combining a trait with your Llama Agent is permanent, making all collections deflationary.<br/><br/> Each trait costs 2 $HAY. Before minting one, you must select your Llama Agent from the dropdown menu. </p>
            </div>
            <div className="w-layout-grid grid-2">
              <div data-hover="false" data-delay={0} id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d815dd-faba1442" data-w-id="c51ac5e2-ed2e-9254-8fc8-bd71e7d815dd" className="dropdown-2 w-dropdown">
                {/* <AgentSelectionDropdown /> */}
                <nav className="dropdown-list-2 w-dropdown-list" />
              </div>
              <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d815f4-faba1442" />
              <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d815f5-faba1442" className="none-mob" />
              <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d815f6-faba1442" className="vert-left space-btw h-472">
                <div className="vert-left">
                  <div className="img-bg" style={{marginBottom:'30px'}}>
                    <img src="images/Skin-15---Tiger.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Skin-15---Tiger-p-500.png 500w, images/Skin-15---Tiger-p-800.png 800w, images/Skin-15---Tiger.png 1000w" alt="" className="llama-img select" />
                  </div>
                  <h3 className="h3 h-white mrg-d-34">Supply: 6,000</h3>
                </div>
                <a href="#" className="button trait-mint w-button">mint skin</a>
              </div>
              <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d81601-faba1442" className="vert-left space-btw h-472">
                <div className="vert-left">
                  <div className="img-bg" style={{marginBottom:'30px'}}><img src="images/Eyes-34---Green-Frame.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Eyes-34---Green-Frame-p-500.png 500w, images/Eyes-34---Green-Frame-p-800.png 800w, images/Eyes-34---Green-Frame.png 1000w" alt="" className="llama-img select dis" /></div>
                  <h3 className="h3 h-white mrg-d-34">Supply: 5,000</h3>
                </div>
                <a href="#" className="button trait-mint w-button">mint eyes</a>
              </div>
              <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d8160e-faba1442" className="vert-left space-btw h-472">
                <div className="vert-left">
                  <div className="img-bg" style={{marginBottom:'30px'}}><img src="images/Mouth-06---Smoking-Marijuana.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Mouth-06---Smoking-Marijuana-p-500.png 500w, images/Mouth-06---Smoking-Marijuana-p-800.png 800w, images/Mouth-06---Smoking-Marijuana.png 1000w" alt="" className="llama-img select dis" /></div>
                  <h3 className="h3 h-white mrg-d-34">Supply: 6,000</h3>
                </div>
                <a href="#" className="button trait-mint w-button">mint mouth</a>
              </div>
              <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d8161b-faba1442" className="vert-left space-btw h-472">
                <div className="vert-left">
                  <div className="img-bg" style={{marginBottom:'30px'}}><img src="images/Clothing-13---Cowboy.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Clothing-13---Cowboy-p-500.png 500w, images/Clothing-13---Cowboy-p-800.png 800w, images/Clothing-13---Cowboy.png 1000w" alt="" className="llama-img select dis" /></div>
                  <h3 className="h3 h-white mrg-d-34">Supply: 5,000</h3>
                </div>
                <a href="#" className="button trait-mint w-button">mint clothing</a>
              </div>
              <div id="w-node-c51ac5e2-ed2e-9254-8fc8-bd71e7d81628-faba1442" className="vert-left space-btw h-472">
                <div className="vert-left">
                  <div className="img-bg" style={{marginBottom:'30px'}}><img src="images/Hat-05---Crown.png" loading="lazy" sizes="(max-width: 991px) 200px, 330px" srcSet="images/Hat-05---Crown-p-500.png 500w, images/Hat-05---Crown-p-800.png 800w, images/Hat-05---Crown.png 1000w" alt="" className="llama-img select dis" /></div>
                  <h3 className="h3 h-white mrg-d-34">Supply: 5,000</h3>
                </div>
                <a href="#" className="button trait-mint w-button">mint hat</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="step-2"><img src="images/Rectangle-10.png" loading="lazy" sizes="(max-width: 991px) 99vw, 100vw" srcSet="images/Rectangle-10-p-500.png 500w, images/Rectangle-10.png 1867w" alt="" className="absolute-bg" />
        <div className="container-m relative w-container">
          <div className="vert-cent">
            <div className="vert-left stretch">
              <h2 className="h3">STEP 2: COMBINE</h2>
              <p className="p1">In this step, you&apos;ll be able to combine your traits with your Llama Agent. Any trait combinations completed below will be permanent.<br /><br />To start, select your Llama Agent and trait NFT from the dropdown menus below. Once you&apos;re happy with your choices, click the &apos;combine&apos; button and approve the transactions. Repeat these steps for every trait to complete your disguise.</p>
            </div>
            <div className="w-layout-grid grid-2">
              <div data-hover="false" data-delay={0} id="w-node-_5fabc8b3-0684-a61b-e57d-11de5a266193-faba1442" data-w-id="5fabc8b3-0684-a61b-e57d-11de5a266193" className="dropdown-2 w-dropdown">
                <AgentSelectionDropdown />
                <nav className="dropdown-list-2 relative w-dropdown-list" />
              </div>
              <div data-hover="false" data-delay={0} id="w-node-_3b4f53e1-655f-3fe7-b1a9-62dbca4e746e-faba1442" className="dropdown-2 mob w-dropdown">
                <TraitSelectionDropdown />
                <nav className="dropdown-list-2 w-dropdown-list" />
              </div>
              <div id="w-node-_5fabc8b3-0684-a61b-e57d-11de5a2661aa-faba1442" className="vert-left">
                <div className="hor-cen m-100-perc vert-mob">
                  <div className="vert-cent"><img src="images/Group-36.png" loading="lazy" alt="" className="llama-img select" />
                    <div className="form-block-2 mob w-form">
                      <form id="email-form" name="email-form" data-name="Email Form" method="get"><input type="text" className="text-field _2 w-input" maxLength={256} name="name-2" data-name="Name 2" placeholder="Alias" id="name-2" /><input type="email" className="text-field _2 w-input" maxLength={256} name="email-2" data-name="Email 2" placeholder="Confirm alias" id="email-2" required /></form>
                      <div className="w-form-done">
                        <div>Thank you! Your submission has been received!</div>
                      </div>
                      <div className="w-form-fail">
                        <div>Oops! Something went wrong while submitting the form.</div>
                      </div>
                    </div>
                    <a href="#" className="button combine w-button">combine</a>
                  </div>
                  <div className="form-block-2 desk w-form">
                    <form id="email-form" name="email-form" data-name="Email Form" method="get"><input type="text" className="text-field _2 w-input" maxLength={256} name="name" data-name="Name" placeholder="Alias" id="name" /><input type="email" className="text-field _2 w-input" maxLength={256} name="email" data-name="Email" placeholder="Confirm alias" id="email" required /></form>
                    <div className="w-form-done">
                      <div>Thank you! Your submission has been received!</div>
                    </div>
                    <div className="w-form-fail">
                      <div>Oops! Something went wrong while submitting the form.</div>
                    </div>
                  </div>
                </div>
                <div className="error-message">
                  <div className="tb-24 red">You cannot combine traits at this time. please come back later.</div>
                </div>
              </div>
              <div data-hover="false" data-delay={0} id="w-node-_5fabc8b3-0684-a61b-e57d-11de5a2661af-faba1442" data-w-id="5fabc8b3-0684-a61b-e57d-11de5a2661af" className="dropdown-2 desk w-dropdown">
                <div style={{ backgroundColor: 'rgb(255,255,255)', color: 'rgba(0,0,0,0.5)' }} className="dropdown-toggle w-dropdown-toggle">
                  <div>select your trait</div>
                  <div className="dd-arrow-wrap"><img src="images/Vector-20.svg" loading="lazy" style={{ filter: 'invert(0%)' }} alt="" className="dd-arrow" /></div>
                </div>
                <nav className="dropdown-list-2 w-dropdown-list" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="blue-bg-div"><img src="images/Vector-4.svg" loading="lazy" alt="" className="d-r-corner" /><img src="images/Rectangle-10.png" loading="lazy" sizes="(max-width: 991px) 99vw, 100vw" srcSet="images/Rectangle-10-p-500.png 500w, images/Rectangle-10.png 1867w" alt="" className="absolute-bg" />
        <div className="container-m relative w-container">
          <div className="vert-left">
            <h3 className="h3 h-white">step 3: mint your id card</h3>
            <p className="p1 p-white">{`ID Cards are NFTs that allow you to edit the metadata name of your Llama Agent and give it a unique alias for 60 $HAY. No two Llamas can have the same name. Mint your Card below then use the 'combine' function above to add/edit your alias.`}</p>
            <div className="hor-cen marg-up vert-mob"><img src="images/Group-36.png" loading="lazy" alt="" className="llama-img step-3" />
              <a href="#" className="button id-card-mint w-button">coming soon</a>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default DisguiseRoom