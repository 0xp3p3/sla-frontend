import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import CandyMachine from "../solana/CandyMachine";
import { CandyMachineAccount } from '../../utils/candy-machine';
import CountDown from "./CountDown";


const LlamaMintingSection = () => {

  const goLiveDate = process.env.NEXT_PUBLIC_GO_LIVE_DATE && (process.env.NEXT_PUBLIC_GO_LIVE_DATE !== 'null') ? new Date(process.env.NEXT_PUBLIC_GO_LIVE_DATE!) : null
  const price = 1.5

  const [cndyMachineState, setCndyMachineState] = useState<CandyMachineAccount>()

  return (
    <div id="mint-llama" className="mint-llama">
      <img src="images/27-1.png" loading="lazy" alt="" className="absolute-llama" />
      <div className="container-s relative w-container">
        <div className="vert-cent">
          <CountDown targetDate={goLiveDate} />
          <CountDown targetDate={new Date("18 Apr 2022 11:00:00 UTC")} />
          <CountDown targetDate={null} />
          <CandyMachine
            candyMachineId={new PublicKey(process.env.NEXT_PUBLIC_CM_ID_AVATAR!)}
            candyMachineCollection={new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_AVATAR!)}
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