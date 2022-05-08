import Head from "next/head";


interface Props {
  title: string,
  ogImageSource: string,
}

const CustomHead = (props: Props) => {
  const url = "https://www.secretllamaagency.com"
  const description = "The Secret Llama Agency is an ecosystem running on the Solana blockchain, featuring the first ever PFP project with customizable traits and aliases. There are 25 Alpaca imposters hidden within the collection. Protect the Agency from sneaky Alpacas and their evil plans!"
  const image = url + props.ogImageSource


  return (
    <Head>
        <title>{props.title}</title>

        <meta name="description" content={description} />

        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" key="type" />
        <meta property="og:title" content={props.title}  key="title"/>
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} key="image" />

        <meta property="twitter:title" content="The Secret Llama Agency" key="twitter_title" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:site" content="@SecretLlama_A" />
        <meta property="twitter:image" content={image} />
    </Head>
  )
}

export default CustomHead