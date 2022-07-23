import { useState } from "react"

import BadgeMintingSingle from "./BadgeMintintSingle"
import { SLA_BRONZE_BADGE, SLA_SILVER_BADGE, SLA_GOLD_BADGE, SLA_PLATINUM_BADGE, SLA_DIAMOND_BADGE } from "../../utils/constants"
import NftSelectionDropdown from "../utils/NftSelectionDropdown"
import useWalletNFTs, { NFT } from "../../hooks/useWalletNFTs"
import styles from "../../styles/BadgeMintingMain.module.css"
import useBadge from "../../hooks/useBadge"


const BadgeMintingMain = () => {
  const { agentWalletNFTs } = useWalletNFTs()

  const [selectedAgent, setSelectedAgent] = useState<NFT>(null)
  const currentBadgeInfo = useBadge(selectedAgent?.mint)

  return (
    <>
      <div className={styles.dropdowns_container}>
        <NftSelectionDropdown
          nfts={agentWalletNFTs}
          text="Select your agent"
          emptyText="No agent to display"
          onChange={setSelectedAgent}
        />
      </div>
      <div id="w-node-_6deb578f-cd05-514c-f1dc-26a916b82dda-e7db2ab3"></div>
      <div id="w-node-b99ca53e-a80f-5bae-8c89-3e1aaa79d07d-e7db2ab3" className="none-mob"></div>
      <div id="w-node-_1e5206db-e4c0-6d6c-91fd-4943b60221eb-e7db2ab3" className="vert-left space-btw h-700">
        <div className="vert-left marg-mob">
          <img src="../images/Bronze.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Bronze-p-500.png 500w, ../images/Bronze-p-800.png 800w, ../images/Bronze.png 1000w" alt="" className="llama-img select" />
          {currentBadgeInfo.bronzeSupply &&
            <h3 className="h3 h-white mrg-d-34">Total Supply: {SLA_BRONZE_BADGE.supply.toLocaleString("en-US")}<br />+{SLA_BRONZE_BADGE.bonusHay} bonus $HAY</h3>
          }
          <div className="p1 p-white">Requirement:<br />- 60 $HAY</div>
        </div>
        {/* <Button className="mint-badge" disabled>Mint Bronze</Button> */}
        <BadgeMintingSingle badge={SLA_BRONZE_BADGE} requiredBadge={null} selectedLlama={selectedAgent} currentBadgeInfo={currentBadgeInfo} />
      </div>
      <div id="w-node-_18afe3ea-d09d-a4a9-d75b-940fffa9d6df-e7db2ab3" className="vert-left space-btw h-700">
        <div className="vert-left marg-mob">
          <img src="../images/Silver.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Silver-p-500.png 500w, ../images/Silver-p-800.png 800w, ../images/Silver.png 1000w" alt="" className="llama-img select" />
          {currentBadgeInfo.silverSupply &&
            <h3 className="h3 h-white mrg-d-34">Total Supply: {SLA_SILVER_BADGE.supply.toLocaleString("en-US")}<br />+{SLA_SILVER_BADGE.bonusHay} Bonus $HAY</h3>
          }
          <div className="p1 p-white">Requirement:<br />- 150 $HAY<br />- Must have a Bronze Ranked Llama agent</div>
        </div>
        {/* <Button className="mint-badge" disabled>Mint Silver</Button> */}
        <BadgeMintingSingle badge={SLA_SILVER_BADGE} requiredBadge={SLA_BRONZE_BADGE} selectedLlama={selectedAgent} currentBadgeInfo={currentBadgeInfo} />
      </div>
      <div id="w-node-_82f835ae-4110-40a3-fcac-b2b115de4b1c-e7db2ab3" className="vert-left space-btw h-700">
        <div className="vert-left marg-mob">
          <img src="../images/Gold.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Gold-p-500.png 500w, ../images/Gold-p-800.png 800w, ../images/Gold.png 1000w" alt="" className="llama-img select" />
          {currentBadgeInfo.goldSupply &&
            <h3 className="h3 h-white mrg-d-34">Total Supply: {SLA_GOLD_BADGE.supply.toLocaleString("en-US")}<br />+{SLA_GOLD_BADGE.bonusHay} Bonus $HAY</h3>
          }
          <div className="p1 p-white">Requirement:<br />- 210 $HAY<br />- Must have a Silver Ranked Llama Agent</div>
        </div>
        {/* <Button className="mint-badge" disabled>Mint Gold</Button> */}
        <BadgeMintingSingle badge={SLA_GOLD_BADGE} requiredBadge={SLA_SILVER_BADGE} selectedLlama={selectedAgent} currentBadgeInfo={currentBadgeInfo} />
      </div>
      <div id="w-node-_5d0b1d89-fa1c-6041-1a9c-2c99ee13eb02-e7db2ab3" className="vert-left space-btw h-700">
        <div className="vert-left marg-mob">
          <img src="../images/Platinum.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Platinum-p-500.png 500w, ../images/Platinum-p-800.png 800w, ../images/Platinum.png 1000w" alt="" className="llama-img select" />
          {currentBadgeInfo.platinumSupply &&
            <h3 className="h3 h-white mrg-d-34">Total Supply: {SLA_PLATINUM_BADGE.supply.toLocaleString("en-US")}<br />+{SLA_PLATINUM_BADGE.bonusHay} Bonus $HAY</h3>
          }
          <div className="p1 p-white">Requirement:<br />- 405 $HAY<br />- Must have a Gold Ranked Llama Agent</div>
        </div>
        {/* <Button className="mint-badge" disabled>Mint Platinum</Button> */}
        <BadgeMintingSingle badge={SLA_PLATINUM_BADGE} requiredBadge={SLA_GOLD_BADGE} selectedLlama={selectedAgent} currentBadgeInfo={currentBadgeInfo} />
      </div>
      <div id="w-node-b3720fa6-9655-bf96-17d8-a8304b6f5463-e7db2ab3" className="vert-left space-btw h-700">
        <div className="vert-left marg-mob">
          <img src="../images/Diamond.png" loading="lazy" sizes="(max-width: 479px) 100vw, (max-width: 767px) 94vw, 330px" srcSet="../images/Diamond-p-500.png 500w, ../images/Diamond-p-800.png 800w, ../images/Diamond.png 1000w" alt="" className="llama-img select" />
          {currentBadgeInfo.diamondSupply &&
            <h3 className="h3 h-white mrg-d-34">Total Supply: {SLA_DIAMOND_BADGE.supply.toLocaleString("en-US")}<br />+{SLA_DIAMOND_BADGE.bonusHay} Bonus $HAY</h3>
          }
          <div className="p1 p-white">Requirement:<br />- 660 $HAY<br />- Must have a Platinum Ranked Llama Agent</div>
        </div>
        {/* <Button className="mint-badge" disabled>Mint Diamond</Button> */}
        <BadgeMintingSingle badge={SLA_DIAMOND_BADGE} requiredBadge={SLA_PLATINUM_BADGE} selectedLlama={selectedAgent} currentBadgeInfo={currentBadgeInfo} />
      </div>
    </>
  )
}

export default BadgeMintingMain