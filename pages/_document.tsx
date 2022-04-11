import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html id="html" data-wf-page="" data-wf-site="62265a75e750c484b04ef32e">
        <Head>
          {/* Fonts */}
          <link href="https://fonts.googleapis.com/css?family=Staatliches" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500&display=swap" rel="stylesheet" />
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