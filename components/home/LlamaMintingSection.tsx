import Button from "../common/Button";
import AgentMintingMain from "../launch/AgentMintingMain";


const LlamaMintingSection = () => {
  return (
    <div id="mint-llama" className="mint-llama" >
      {/* <img src="images/27-1.png" loading="lazy" alt="" className="absolute-llama" /> */}
      <div className="container-s relative w-container" style={{ marginTop: "100px" }}>
        <div className="vert-cent">
          <h1 className="h1" style={{ marginTop: "100px" }}>SLA Recruitment Center</h1>
          {/* <div style={{ marginTop: "100px" }}> */}
            <a style={{width: "300px"}} href="https://www.magiceden.io/creators/secretllamaagency" target="_blank" rel="noreferrer" className="button w-button">View on Magic Eden</a>
          {/* </div> */}
          {/* <AgentMintingMain /> */}
        </div>
      </div>
    </div>
  )
}

export default LlamaMintingSection