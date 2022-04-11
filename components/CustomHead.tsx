import Head from "next/head";


const CustomHead = (props: { title: string }) => {
  return (
    <Head>
      <meta content={props.title} property="og:title" key="title"/>
      <meta content={props.title} property="twitter:title" key="twitter_title" />
      <title>{props.title}</title>
  </Head>
  )
}

export default CustomHead