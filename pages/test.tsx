import type { NextPage } from "next";
import { PublicKey } from "@solana/web3.js";

import ConnectWallet from "../components/wallet/ConnectWallet";
import CandyMachine from "../components/solana/CandyMachine";


const Index: NextPage = () => {
  const cm_id = process.env.NEXT_PUBLIC_CM_ID_AVATAR!

  return (
    <>
      <ConnectWallet className="button blue nav mob w-button" />

      <CandyMachine
        candyMachineId={new PublicKey(cm_id)}
        candyMachineCollection={new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_AVATAR!)}
        rpcUrl={process.env.NEXT_PUBLIC_SOLANA_ENDPOINT!}
        price={'(1.5 SOL)'}
      />
    </>
  )
}

export default Index