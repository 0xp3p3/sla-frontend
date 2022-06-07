import 'semantic-ui-css/semantic.min.css'
import '../styles/globals.css'
import '../styles/ConnectWallet.css'

import type { AppProps } from 'next/app'
import WalletConnectionProvider from '../components/wallet/WalletConnectionProvider'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <WalletConnectionProvider>
        <Component {...pageProps} />
      </WalletConnectionProvider>
    </>
  )
}

export default MyApp
