import AgentMintingButton from "../launch/AgentMintingButton";


const LlamaMintingSection = () => {
  return (
    <div id="mint-llama" className="mint-llama">
      <img src="images/27-1.png" loading="lazy" alt="" className="absolute-llama" />
      <div className="container-s relative w-container">
        <div className="vert-cent">
        <h1 className="h1 ">MINTING</h1>
          {/* <CountDown targetDate={goLiveDate} /> */}
          {/* <CandyMachine
            candyMachineId={candyMachineId}
            candyMachineCollection={candyMachineCollection}
            rpcUrl={process.env.NEXT_PUBLIC_SOLANA_ENDPOINT!}
            price={price}
            setCandyMachineStateCallback={setCndyMachineState}
            isWhitelistOn={true}
          /> */}
          <AgentMintingButton />
          {/* <h3 className="h3-small get-whitelisted">
            Haven&apos;t been whitelisted yet?<br /> 
            <a href="https://discord.gg/5STFvY9nu5" target="_blank" rel="noreferrer">Join our Discord</a> for a chance to get a spot!
          </h3> */}
        </div>
      </div>
    </div>
  )
}

export default LlamaMintingSection