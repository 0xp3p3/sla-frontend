import Head from "next/head";
import Script from "next/script";
import { useEffect } from "react";
import Footer from "./Footer";
import Navigation from "./Navigation";


interface Props {
  title: string,
  webflowPageId: string,
  children: React.ReactNode,
}

const PageWrapper = (props: Props) => {

  useEffect(() => {
    document.getElementById('html').setAttribute("data-wf-page", props.webflowPageId)
  }, [])

  return (
    <div>
      <Head>
        <meta content={props.title} property="og:title" key="title"/>
        <meta content={props.title} property="twitter:title" key="twitter_title" />
        <title>{props.title}</title>
      </Head>
      <div className="page-wrapper" id="top-of-page">
        <Navigation />
        {props.children}
        <Footer />
        <a href="#top-of-page" className="backtotop w-inline-block">
          <img src="images/Group-37.svg" loading="lazy" alt="" className="btt-img" />
        </a>
      </div>
      <Script src="js/webflow.js" type="text/javascript"></Script>
  </div>
  )
}

export default PageWrapper