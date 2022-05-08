import Head from "next/head";


interface Props {
  title: string,
  ogImageSource: string,
}

const CustomHead = (props: Props) => {
  return (
    <Head>
        <meta property="og:url" content={"https://www.secretllamaagency.com/"} />
        <meta property="og:type" content="website" key="type" />
        <meta property="og:title" content={props.title}  key="title"/>
        <meta property="og:description" content="The Secret Llama Agency is an ecosystem running on the Solana blockchain, featuring the first ever PFP project with customizable traits and aliases. There are 25 Alpaca imposters hidden within the collection. Protect the Agency from sneaky Alpacas and their evil plans!" key="description" />
        <meta property="og:image" content={props.ogImageSource} key="image" />

        <meta property="twitter:title" content={props.title} key="twitter_title" />
        <meta property="twitter:card" content="summary" />
        
        <title>{props.title}</title>
    </Head>
  )
}

export default CustomHead