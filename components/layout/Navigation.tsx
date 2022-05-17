import ConnectWallet from "../wallet/ConnectWallet";


interface Props {
  webflowSandwichMenuId: string,
}


const Navigation = (props: Props) => {
  return (
    <>
      <div style={{ display: 'none', WebkitTransform: 'translate3d(0, -100%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', msTransform: 'translate3d(0, -100%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)', transform: 'translate3d(0, -100%, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0)' }} className="menu-overlay">
        <div className="vert-left">
          <a href="/home" className="nav-link mob">Mint Llama</a>
          <a href="documents/Whitepaper.pdf" target="_blank" rel="noreferrer" className="nav-link mob">WHITEPAPER</a>
          <a href="/hay" className="nav-link mob">$HAY</a>
          <a href="/home#roadmap" className="nav-link mob">ROADMAP</a>
          <a href="/staking" className="nav-link mob">STAKE</a>
          <div data-hover="false" data-delay={0} className="dropdown mob w-dropdown">
            <div className="nav-link dd w-dropdown-toggle">
              <div>agents only</div>
              <img src="images/Vector-13.svg" loading="lazy" alt="" className="arrow-dd" />
            </div>
            <nav className="dropdown-list mob w-dropdown-list">
              <a href="/disguiseRoom" className="nav-link dd-list mob w-dropdown-link">the disguise room</a>
            </nav>
          </div>
        </div>
        <div className="hor-cen center">
          <ConnectWallet className="button blue nav mob w-button" />
        </div>
      </div>
      <div style={{ borderColor: 'rgb(0,0,0)' }} className="navbar">
        <a href="/home" className="nav-logo-link w-inline-block">
          <img src="images/Logo-7.png" loading="lazy" sizes="80px" srcSet="images/Logo-7-p-500.png 500w, images/Logo-7-p-800.png 800w, images/Logo-7.png 1000w" alt="" className="logo-n-img" />
        </a>
        <div className="navbar-middle">
          <a href="/home#top-of-page" className="nav-link">Mint Llama</a>
          <a href="/documents/Whitepaper.pdf" target="_blank" rel="noreferrer" className="nav-link">white paper</a>
          <a href="/hay" className="nav-link">$HAY</a>
          <a href="/home#roadmap" className="nav-link">roadmap</a>
          <a href="/staking" className="nav-link">stake</a>
          <div data-hover="false" data-delay={0} className="dropdown w-dropdown">
            <div className="nav-link dd w-dropdown-toggle">
              <div>agents only</div><img src="images/Vector-13.svg" loading="lazy" alt="" className="arrow-dd" />
            </div>
            <nav className="dropdown-list w-dropdown-list">
              <a href="/disguiseRoom" className="nav-link dd-list w-dropdown-link">the disguise room</a>
            </nav>
          </div>
        </div>
        <div className="right-nav">  
          <ConnectWallet className="button blue nav w-button"/>
          <a data-w-id={props.webflowSandwichMenuId} href="#" className="menu-button w-inline-block"><img src="images/Hamburger-1.svg" loading="lazy" alt="" className="hamburger-img" /></a>
          <div className="socials-wrap _2 desk">
            <a href="https://www.tiktok.com/@secretllamaagency" target="_blank" rel="noreferrer" className="social-link w-inline-block"><img src="images/Vector-17.svg" loading="lazy" alt="" className="socials-img" /></a>
            <a href="https://discord.gg/5STFvY9nu5" target="_blank" rel="noreferrer" className="social-link w-inline-block"><img src="images/Vector-16.svg" loading="lazy" alt="" className="socials-img" /></a>
            <a href="https://twitter.com/SecretLlama_A" target="_blank" rel="noreferrer" className="social-link w-inline-block"><img src="images/Vector-15.svg" loading="lazy" alt="" className="socials-img" /></a>
            <a href="https://www.instagram.com/secretllamaagency/" target="_blank" rel="noreferrer" className="social-link _4 w-inline-block"><img src="images/Vector-14.svg" loading="lazy" alt="" className="socials-img" /></a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navigation