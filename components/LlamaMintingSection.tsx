import CandyMachine from "../components/solana/CandyMachine";
import CountDown from "../components/CountDown";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

import { CandyMachineAccount } from '../utils/candy-machine';


const LlamaMintingSection = () => {

  const [date, setDate] = useState<Date | null>()

  useEffect(() => {
    const d = process.env.NEXT_PUBLIC_GO_LIVE_DATE
    console.log(process.env.NEXT_PUBLIC_GO_LIVE_DATE)
    if (d && d != 'null') {
      setDate(new Date(process.env.NEXT_PUBLIC_GO_LIVE_DATE!))
    } else {
      console.log('date is not updated')
    }
  }, [process.env])

  useEffect(() => {
    setTimeout(() => {
      console.log(process.env.NEXT_PUBLIC_GO_LIVE_DATE)
      setDate(new Date(process.env.NEXT_PUBLIC_GO_LIVE_DATE!))
    }, 1000)
  })

  const goLiveDate = process.env.NEXT_PUBLIC_GO_LIVE_DATE && (process.env.NEXT_PUBLIC_GO_LIVE_DATE !== 'null') ? new Date(process.env.NEXT_PUBLIC_GO_LIVE_DATE!) : null
  const price = 1.5

  const [cndyMachineState, setCndyMachineState] = useState<CandyMachineAccount>()

  return (
    <div id="mint-llama" className="mint-llama">
      <img src="images/27-1.png" loading="lazy" alt="" className="absolute-llama" />
      <div className="container-s relative w-container">
        <div className="vert-cent">
          <p>GoLive date: {goLiveDate ? goLiveDate.toDateString() : 'nothing'}</p>
          <p>DATE: {date ? date.toDateString() : 'not there'}</p>
          <CountDown date={goLiveDate} />
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