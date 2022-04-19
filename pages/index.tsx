import type { NextPage } from "next";
import IndexPageWrapper from "../components/layout/IndexWrapper";
import TypingEffect from "../components/utils/TypingEffect";

const Index: NextPage = () => {

  return (
    <IndexPageWrapper title="Secret Llama Agency">
      <div className="start-nav">  
        <a href="#" className="nav-logo-link w-inline-block"><img src="images/Logo-7.png" loading="lazy" sizes="(max-width: 479px) 17vw, (max-width: 767px) 16vw, 80px" srcSet="images/Logo-7-p-500.png 500w, images/Logo-7-p-800.png 800w, images/Logo-7.png 1000w" alt="" className="logo-n-img" /></a>
        <div className="tb-start-logo">SECRET LLAMA AGENCY</div>
        <div className="socials-wrap desk">
          <a href="https://www.tiktok.com/@secretllamaagency" target="_blank" rel="noreferrer" className="social-link w-inline-block"><img src="images/Vector-17.svg" loading="lazy" alt="" className="socials-img" /></a>
          <a href="https://discord.gg/5STFvY9nu5" target="_blank" rel="noreferrer" className="social-link w-inline-block"><img src="images/Vector-16.svg" loading="lazy" alt="" className="socials-img" /></a>
          <a href="https://twitter.com/SecretLlama_A" target="_blank" rel="noreferrer" className="social-link w-inline-block"><img src="images/Vector-15.svg" loading="lazy" alt="" className="socials-img" /></a>
          <a href="https://www.instagram.com/secretllamaagency/" target="_blank" rel="noreferrer" className="social-link _4 w-inline-block"><img src="images/Vector-14.svg" loading="lazy" alt="" className="socials-img" /></a>
        </div>
      </div>
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-img start">
            <img src="images/Group-37-1.svg" loading="lazy" alt="" className="scroll-down-img moveArrow" />
          </div>
          <div className="agent-div">
            <img src="images/Rectangle-8-1.png" loading="lazy" sizes="(max-width: 767px) 120px, (max-width: 991px) 140px, 200px" srcSet="images/Rectangle-8-1-p-500.png 500w, images/Rectangle-8-1-p-800.png 800w, images/Rectangle-8-1-p-1080.png 1080w, images/Rectangle-8-1.png 1280w" alt="" className="agent-img" />
            <div className="vert-left _100 cent-mob">
              <div className="tb-32 margin-d"><strong>Agent Maken</strong>: </div>
              <div id="typed" className="tb-32 typedwithcursor">
                <TypingEffect text="Hey, you there! How did you find this place? ... You better not be one of those Alpacas. Don't tell anyone what you found here, now go away!" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sneakin-div">  
        <a href="/home" className="button w-button">Sneak in</a>
      </div>
    </IndexPageWrapper>
  );
}

export default Index