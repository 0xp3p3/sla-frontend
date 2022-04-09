import type { NextPage } from "next";
import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";
import TypingEffect from "../components/TypingEffect";

const Index: NextPage = () => {

  useEffect(() => {
    document.getElementById('html').setAttribute("data-wf-page", "62265a75e750c452a74ef32f")
  }, [])

  return (
    <div>
      <Script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=62265a75e750c484b04ef32e" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossOrigin="anonymous"></Script>
      <title>Secret Llama Agency</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      {/* <link href="images/favicon.png" rel="shortcut icon" type="image/x-icon" /> */}
      {/* <link href="images/webclip.png" rel="apple-touch-icon" /> */}
      <div className="page-wrapper">
        <div className="start-nav">
          <Link href="#">
            <a className="nav-logo-link w-inline-block"><img src="images/Logo-7.png" loading="lazy" sizes="(max-width: 479px) 17vw, (max-width: 767px) 16vw, 80px" srcSet="images/Logo-7-p-500.png 500w, images/Logo-7-p-800.png 800w, images/Logo-7.png 1000w" alt="" className="logo-n-img" /></a>
          </Link>
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
                  <TypingEffect text="Hey, you there! How did you find this place? ... You better not be one of those Alpacas. Don't tell anyone what you found here, now go away!"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sneakin-div">
          <Link href="/home"> 
            <a className="button w-button">Sneak in</a>
          </Link>
        </div>
      </div>
      <Script src="js/webflow.js" type="text/javascript"></Script>
    </div>
  );
}

export default Index