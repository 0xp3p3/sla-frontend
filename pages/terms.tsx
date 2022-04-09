import type { NextPage } from "next";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";


const Terms: NextPage = () => {
  return (
    <div>
      <meta charSet="utf-8" />
      <title>Terms &amp; Conditions</title>
      <meta content="Terms &amp; Conditions" property="og:title" />
      <meta content="Terms &amp; Conditions" property="twitter:title" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <link href="images/favicon.png" rel="shortcut icon" type="image/x-icon" />
      <link href="images/webclip.png" rel="apple-touch-icon" />
      <div className="page-wrapper">
        <Navigation />
        <div className="blue-bg-div outline-none">
          <div id="top" className="top-trigger" />
          <div className="container-m w-container">
            <div className="vert-cent">
              <h1 className="h2 marg-126">TERMS AND CONDITIONS</h1>
              <div className="vert-stretch top">
                <div className="vert-left stretch terms">
                  <h2 className="h3 h-white">Please read all these terms and conditions.</h2>
                  <p className="p1 p-white">As we can accept your order and make a legally enforceable agreement without further reference to you, you must read these terms and conditions to make sure that they contain all that you want and nothing that you are not happy with.</p>
                </div>
                <div className="vert-left stretch terms">
                  <h2 className="h3 h-white">Application</h2>
                  <p className="p1 p-white">1. These Terms and Conditions will apply to the purchase of the goods by you (the Customer or you). We are Secret Llama Agency, an online partnership that can be reached at: <a href="#" className="link"><span className="red-spam">admin@secretllamaagency.com</span></a>; &nbsp;<br />(the Supplier or us or we).<br />2. These are the terms on which we sell all Goods to you. By ordering any of the Goods, you agree to be bound by these Terms and Conditions. &nbsp;<br />By ordering any of the Services, you agree to be bound by these Terms and Conditions. &nbsp;You can only purchase the Goods from the Website if you are eligible to enter into a contract and are at least 18 years old.<br /></p>
                </div>
                <div className="vert-left stretch terms">
                  <h2 className="h3 h-white">Interpretation</h2>
                  <p className="p1 p-white">{`3. Consumer means an individual acting for purposes which are wholly or mainly outside their trade, business, craft or profession;<br />4. &nbsp;Contract means the legally-binding agreement between you and us for the supply of the Goods;<br />5. Goods means the goods advertised on the Website that we supply to you of the number and description as set out in the Order;<br />6. Order means the Customer's order for the Goods from the Supplier as submitted following the step by step process set out on the Website;<br />7. Privacy Policy means the terms which set out how we will deal with confidential and personal information received from you via the Website;<br />8. Website means our website <a href="#" className="link"><span className="red-spam">secretllamaagency.com</span></a> on which the Goods are advertised.`}<br /></p>
                </div>
                <div className="vert-left stretch terms">
                  <h2 className="h3 h-white">Goods</h2>
                  <p className="p1 p-white">9. The description of the Goods is as set out on the Website, catalogs, brochures or other form of advertisement. Any description is for illustrative purposes only and there may be small discrepancies in the size and color of the Goods supplied.<br />10. Secret Llama Agency is a brand of NFTs, to which consumers will be purchasing a Non-Fungible Token.<br />11. All Goods which appear on the Website are subject to availability.<br />12. The NFT will be minted via the Solana Blockchain.<br /></p>
                </div>
                <div className="vert-left stretch terms">
                  <h2 className="h3 h-white">Personal information</h2>
                  <p className="p1 p-white">13. We retain and use all information strictly under the Privacy Policy.<br />14. We may contact you using e-mail or other electronic communication methods and by pre-paid post and you expressly agree to this.</p>
                </div>
                <div className="vert-left stretch terms">
                  <h2 className="h3 h-white">Price and Payment</h2>
                  <p className="p1 p-white">15. The price of the Goods and any additional delivery or other charges is that set out on the Website at the date of the Order or such other price as we may agree in writing.<br />16. Prices and charges may include VAT at the rate applicable at the time of the Order.<br />17. You must pay by using SOL.</p>
                </div>
                <div className="vert-left stretch terms">
                  <h2 className="h3 h-white">Risk and Title</h2>
                  <p className="p1 p-white">18. Risk of damage to, or loss of, any Goods will pass to you when the Goods are delivered to you.<br />19. You do not own the Goods until we have received payment in full. If full payment is overdue or a step occurs towards your bankruptcy, we can choose, by notice to cancel any delivery and end any right to use the Goods still owned by you, in which case you must return them or allow us to collect them.</p>
                </div>
                <div className="vert-left stretch terms">
                  <h2 className="h3 h-white">Ownership</h2>
                  <p className="p1 p-white">20. Once minted, the consumer will have full economic ownership of the token.<br />21. The owner of the NFT will have ownership of the underlying NFT and art, but will grant the use of the art in respect to future business endeavors of the seller.<br />22. The owner may also use the underlying token and art in respect to any business or personal venture, with a full entitlement to any proceeds to which set token generates. The seller will have no claim on any revenue generated because of the owner’s token.<br />23. Any $Hay token generated in respect to the NFT will not be categorized as a security token or as an investment, but instead as an utility token for the owner of the NFT. They will use the $Hay token in any way they wish, including selling it on any exchange.<br /></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <a href="#top" className="backtotop w-inline-block"><img src="images/Group-37.svg" loading="lazy" alt="" className="btt-img" /></a>
      </div>
    </div>
  )
}

export default Terms