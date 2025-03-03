import { FC } from "react";

const Footer: FC = () => {
  return (
    <div className="footer"><img src="images/pattern-big.png" loading="lazy" sizes="(max-width: 991px) 99vw, 100vw" srcSet="images/pattern-big-p-500.png 500w, images/pattern-big.png 1866w" alt="" className="absolute-bg" />
      <div className="container-l relative w-container">
        <div className="hor-cen center mob-vert">
          <a href="/home" className="footer-logo w-inline-block"><img src="images/Group-41.png" loading="lazy" sizes="(max-width: 479px) 86vw, 250px" srcSet="images/Group-41-p-500.png 500w, images/Group-41.png 516w" alt="" className="footer-logo-img" /></a>
          <div className="absolute-div">
            <div className="footer-links">
              <div className="vert-left foot-div">
                <a href="/home#mint-llama" className="tb-15 foot-link">MINT LLAMA</a>
                <a href="/home#about" className="tb-15 foot-link">ABOUT US</a>
                <a href="/home#features" className="tb-15 foot-link">FEATURES</a>
              </div>
              <div className="vert-left">
                <a href="/home#roadmap" className="tb-15 foot-link">ROADMAP</a>
                <a href="/documents/Whitepaper.pdf" target="_blank" rel="noreferrer" className="tb-15 foot-link">WHITE PAPER</a>
                <a href="/terms" aria-current="page" className="tb-15 foot-link _4 w--current">TERMS &amp; CONDITIONS</a>
              </div>
            </div>
            <div className="foot-socials">
              <a href="https://www.tiktok.com/@secretllamaagency" target="_blank" rel="noreferrer" className="social-link footer-link w-inline-block"><img src="images/Vector-17.svg" loading="lazy" alt="" className="socials-img" /></a>
              <a href="https://discord.gg/5STFvY9nu5" target="_blank" rel="noreferrer" className="social-link footer-link w-inline-block"><img src="images/Vector-16.svg" loading="lazy" alt="" className="socials-img" /></a>
              <a href="https://twitter.com/SecretLlama_A" target="_blank" rel="noreferrer" className="social-link footer-link w-inline-block"><img src="images/Vector-15.svg" loading="lazy" alt="" className="socials-img" /></a>
              <a href="https://www.instagram.com/secretllamaagency/" target="_blank" rel="noreferrer" className="social-link _4 footer-link w-inline-block"><img src="images/Vector-14.svg" loading="lazy" alt="" className="socials-img" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer