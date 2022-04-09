import Link from "next/link";
import { FC } from "react";


const Navigation: FC = () => {
  return (
    <>
      <div style={{ display: 'none', WebkitTransform: 'translate3d(0, -100%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', MozTransform: 'translate3d(0, -100%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', msTransform: 'translate3d(0, -100%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', transform: 'translate3d(0, -100%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' }} className="menu-overlay">
        <div className="vert-left">
          <a href="/home#mint-llama" className="nav-link mob">Mint llama</a>
          <a href="https://www.secretllamaagency.com/home#about" className="nav-link mob">about us</a>
          <a href="https://www.secretllamaagency.com/home#features" className="nav-link mob">features</a>
          <a href="hay.html" className="nav-link mob">$HAY</a>
          <a href="https://www.secretllamaagency.com/home#roadmap" className="nav-link mob">ROADMAP</a>
          <a href="documents/Whitepaper.pdf" target="_blank" className="nav-link mob">WHITEPAPER</a>
          <div data-hover="false" data-delay={0} className="dropdown mob w-dropdown">
            <div className="nav-link dd w-dropdown-toggle">
              <div>agents only</div><img src="images/Vector-13.svg" loading="lazy" alt="" className="arrow-dd" />
            </div>
            <nav className="dropdown-list mob w-dropdown-list">
              <a href="the-disguise-room.html" className="nav-link dd-list mob w-dropdown-link">the disguise room</a>
            </nav>
          </div>
        </div>
        <div className="hor-cen center">
          <a href="#" className="button blue nav mob w-button">connect wallet</a>
        </div>
      </div>
      <div style={{ borderColor: 'rgb(0,0,0)' }} className="navbar">
        <Link href="/home">
          <a className="nav-logo-link w-inline-block"><img src="images/Logo-7.png" loading="lazy" sizes="80px" srcSet="images/Logo-7-p-500.png 500w, images/Logo-7-p-800.png 800w, images/Logo-7.png 1000w" alt="" className="logo-n-img" /></a>  
        </Link>
        <Link href="/home#mint-llama">
          <a className="nav-link">Mint llama</a>
        </Link>
        <Link href="/home#about"><a className="nav-link">about us</a></Link>
        <Link href="/home#features"><a className="nav-link">features</a></Link>
        <Link href="/hay"><a className="nav-link">$hay</a></Link>
        <Link href="/home#roadmap"><a className="nav-link">roadmap</a></Link>
        <a href="/documents/Whitepaper.pdf" target="_blank" className="nav-link">white paper</a>
        <div data-hover="false" data-delay={0} className="dropdown w-dropdown">
          <div className="nav-link dd w-dropdown-toggle">
            <div>agents only</div><img src="images/Vector-13.svg" loading="lazy" alt="" className="arrow-dd" />
          </div>
          <nav className="dropdown-list w-dropdown-list">
            <Link href="/disguiseRoom"><a className="nav-link dd-list w-dropdown-link">the disguise room</a></Link>
          </nav>
        </div>
        <div className="right-nav">
          <a href="#" className="button blue nav w-button">connect wallet</a>
          <a data-w-id="5ce6e18e-8d75-a4d6-e6f1-41aa05e2a37d" href="#" className="menu-button w-inline-block"><img src="images/Hamburger-1.svg" loading="lazy" alt="" className="hamburger-img" /></a>
          <div className="socials-wrap _2 desk">
            <a href="https://www.tiktok.com/@secretllamaagency" target="_blank" className="social-link w-inline-block"><img src="images/Vector-17.svg" loading="lazy" alt="" className="socials-img" /></a>
            <a href="https://discord.gg/5STFvY9nu5" target="_blank" className="social-link w-inline-block"><img src="images/Vector-16.svg" loading="lazy" alt="" className="socials-img" /></a>
            <a href="https://twitter.com/SecretLlama_A" target="_blank" className="social-link w-inline-block"><img src="images/Vector-15.svg" loading="lazy" alt="" className="socials-img" /></a>
            <a href="https://www.instagram.com/secretllamaagency/" target="_blank" className="social-link _4 w-inline-block"><img src="images/Vector-14.svg" loading="lazy" alt="" className="socials-img" /></a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navigation