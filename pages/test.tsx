import type { NextPage } from "next";
import PageWrapper from "../components/layout/PageWrapper";
import WalletConnectionProvider from "../components/wallet/WalletConnectionProvider";

const Index: NextPage = () => {

  return (
   <div>
      <PageWrapper title="Home" webflowPageId="6227e74c03fec25390cb9dd4" webflowSandwichMenuId="71e26f4a-7c30-586b-66a0-c09294f2d09c">
        <WalletConnectionProvider> </WalletConnectionProvider>
      </PageWrapper>
   </div> 
  )
}

export default Index