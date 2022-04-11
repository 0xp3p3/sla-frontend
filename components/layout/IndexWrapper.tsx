import Head from "next/head";
import Script from "next/script";


interface Props {
  title: string,
  children: React.ReactNode,
}

const IndexPageWrapper = (props: Props) => {
  return (
    <div>
      <Head>
        <meta content={props.title} property="og:title" key="title"/>
        <meta content={props.title} property="twitter:title" key="twitter_title" />
        <title>{props.title}</title>
      </Head>
      <div className="page-wrapper">
        {props.children}
      </div>
      <Script src="js/webflow.js" type="text/javascript"></Script>
  </div>
  )
}

export default IndexPageWrapper