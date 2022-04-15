import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html id="html" data-wf-page="" data-wf-site="62265a75e750c484b04ef32e">
        <Head>
          
          {/* Meta tags used by Webflow */}
          <meta content="width=device-width, initial-scale=1" name="viewport" />
          <link href="/images/favicon.png" rel="shortcut icon" type="image/x-icon" />
          <link href="/images/webclip.png" rel="apple-touch-icon" />
          
          {/* Fonts */}
          <link href="https://fonts.googleapis.com/css?family=Staatliches" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
          
          {/* Scripts from Webflow */}
          <script src="/js/webflow_jquery.js" type="text/javascript" />
        </Head>
        <body className="body">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument