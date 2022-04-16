import type { NextPage } from "next";
import { PublicKey } from "@solana/web3.js";

import MintFromCandyMachine from "../components/solana/MintFromCandyMachine";


const Index: NextPage = () => {

  const cm_id = process.env.NEXT_PUBLIC_CM_ID_AVATAR!
  console.log('cm_id: ', cm_id)

  return (
    <MintFromCandyMachine 
      candyMachinePubkey={new PublicKey(cm_id)}
      collectionMint={new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_AVATAR!)}
      rpcUrl={process.env.NEXT_PUBLIC_SOLANA_ENDPOINT!} 
    />
  )
}

export default Index