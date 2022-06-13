import AgentMintingMain from "../launch/AgentMintingMain";


const LlamaMintingSection = () => {
  return (
    <div id="mint-llama" className="mint-llama">
      <img src="images/27-1.png" loading="lazy" alt="" className="absolute-llama" />
      <div className="container-s relative w-container">
        <div className="vert-cent">
        <h1 className="h1 ">MINTING</h1>
          <AgentMintingMain />
        </div>
      </div>
    </div>
  )
}

export default LlamaMintingSection