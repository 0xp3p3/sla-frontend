import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import CandyMachine from "../solana/CandyMachine";
import { CandyMachineAccount } from '../../utils/candy-machine';
import CountDown from "./CountDown";


const extractEnvVar = (value: string | null): string | null => {
  return value && (value !== 'null') ? value! : null
} 


const LlamaMintingSection = () => {

  const goLiveDate = extractEnvVar(process.env.NEXT_PUBLIC_GO_LIVE_DATE) ? new Date(process.env.NEXT_PUBLIC_GO_LIVE_DATE!) : null
  const price = 1.5

  const candyMachineId = extractEnvVar(process.env.NEXT_PUBLIC_CM_ID_AVATA) ? new PublicKey(process.env.NEXT_PUBLIC_CM_ID_AVATAR!) : null
  const candyMachineCollection = extractEnvVar(process.env.NEXT_PUBLIC_COLLECTION_AVATAR) ? new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_AVATAR!) : null

  const [cndyMachineState, setCndyMachineState] = useState<CandyMachineAccount>()

  return (
    <div id="mint-llama" className="mint-llama">
      <img src="images/27-1.png" loading="lazy" alt="" className="absolute-llama" />
      <div className="container-s relative w-container">
        <div className="vert-cent">
          <CountDown targetDate={goLiveDate} />
          <CandyMachine
            candyMachineId={candyMachineId}
            candyMachineCollection={candyMachineCollection}
            rpcUrl={process.env.NEXT_PUBLIC_SOLANA_ENDPOINT!}
            price={price}
            setCandyMachineStateCallback={setCndyMachineState}
          />
        </div>
      </div>
    </div>
  )
}

export default LlamaMintingSection