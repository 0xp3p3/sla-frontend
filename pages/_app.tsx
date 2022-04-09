import '../styles/webflow/normalize.css'
import '../styles/webflow/webflow.css'
import '../styles/webflow/secret-llama-agency.webflow.css'

import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
