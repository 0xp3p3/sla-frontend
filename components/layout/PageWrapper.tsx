import Script from "next/script";
import { useEffect } from "react";
import CustomHead from "./CustomHead";
import Footer from "./Footer";
import Navigation from "./Navigation";


interface Props {
  title: string,
  ogImageSource: string,
  webflowPageId: string,
  webflowSandwichMenuId: string,
  children: React.ReactNode,
  toTopArrow: boolean,
}

const PageWrapper = (props: Props) => {

  useEffect(() => {
    document.getElementById('html').setAttribute("data-wf-page", props.webflowPageId);

  }, [])

  return (
    <div>
      <CustomHead title={props.title} ogImageSource={props.ogImageSource} />
      <div className="page-wrapper" id="top-of-page">
        <Navigation webflowSandwichMenuId={props.webflowSandwichMenuId} />
        {props.children}
        <Footer />
        {props.toTopArrow &&
          <a href="#top-of-page" className="backtotop w-inline-block">
            <img src="images/Group-37.svg" loading="lazy" alt="" className="btt-img" />
          </a>
        }
      </div>
      <Script src="js/webflow.js" type="text/javascript"></Script>
    </div>
  )
}

export default PageWrapper