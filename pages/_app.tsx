import '../styles/globals.css'
import '../styles/ConnectWallet.css'

import type { AppProps } from 'next/app'
import WalletConnectionProvider from '../components/wallet/WalletConnectionProvider'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletConnectionProvider>
      <Component {...pageProps} />
    </WalletConnectionProvider>
  )
}

export default MyApp
