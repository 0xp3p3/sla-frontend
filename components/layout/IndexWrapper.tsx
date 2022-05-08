import Script from "next/script";
import CustomHead from "./CustomHead";


interface Props {
  title: string,
  ogImageSource: string,
  children: React.ReactNode,
}

const IndexPageWrapper = (props: Props) => {
  return (
    <div>
      <CustomHead title={props.title} ogImageSource={props.ogImageSource} />
      <div className="page-wrapper">
        {props.children}
      </div>
      <Script src="js/webflow.js" type="text/javascript"></Script>
  </div>
  )
}

export default IndexPageWrapper