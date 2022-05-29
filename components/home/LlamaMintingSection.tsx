import { PublicKey } from "@solana/web3.js";
import { useState } from "react";

import CandyMachine from "../solana/CandyMachine";
import { CandyMachineAccount } from '../../utils/candy-machine';
import CountDown from "./CountDown";


const extractEnvVar = (value: string | null): string | null => {
  return (value && (value !== 'null')) ? value! : null
} 


const LlamaMintingSection = () => {

  const goLiveDate = extractEnvVar(process.env.NEXT_PUBLIC_GO_LIVE_DATE) ? new Date(process.env.NEXT_PUBLIC_GO_LIVE_DATE!) : null
  const price = parseFloat(process.env.NEXT_PUBLIC_MINT_PRICE)

  const candyMachineId = extractEnvVar(process.env.NEXT_PUBLIC_CM_ID_AVATAR) ? new PublicKey(process.env.NEXT_PUBLIC_CM_ID_AVATAR!) : null
  const candyMachineCollection = extractEnvVar(process.env.NEXT_PUBLIC_COLLECTION_AVATAR) ? new PublicKey(process.env.NEXT_PUBLIC_COLLECTION_AVATAR!) : null

  const [cndyMachineState, setCndyMachineState] = useState<CandyMachineAccount>()

  return (
    <div id="mint-llama" className="mint-llama">
      <img src="images/27-1.png" loading="lazy" alt="" className="absolute-llama" />
      <div className="container-s relative w-container">
        <div className="vert-cent">
          <CountDown targetDate={goLiveDate} />
          {/* <CountDown targetDate={new Date("21 Apr 2022 11:00:00 UTC")} /> */}
          <CandyMachine
            candyMachineId={candyMachineId}
            candyMachineCollection={candyMachineCollection}
            rpcUrl={process.env.NEXT_PUBLIC_SOLANA_ENDPOINT!}
            price={price}
            setCandyMachineStateCallback={setCndyMachineState}
            isWhitelistOn={true}
          />
          <p className="mint-comment" style={{fontStyle: 'italic', marginBottom: "10px"}}>33% (0.5 SOL) will go to the community wallet.</p>
          <h3 className="h3-small get-whitelisted">
            Haven&apos;t been whitelisted yet?<br /> 
            <a href="https://discord.gg/5STFvY9nu5" target="_blank" rel="noreferrer">Join our Discord</a> for a chance to get a spot!
          </h3>
        </div>
      </div>
    </div>
  )
}

export default LlamaMintingSection