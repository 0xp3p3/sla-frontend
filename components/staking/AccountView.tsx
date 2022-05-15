import { useWallet } from "@solana/wallet-adapter-react"
import { NFT } from "../../hooks/useWalletNFTs";
import CollectionItem from "./CollectionItem";
import SummaryItem from "./SummaryItem";
import { FarmState } from "../../hooks/useGemFarmStaking";
import { useEffect, useState } from "react";


const AccountSummaryRow = ({ farmerAcc, rewardAvailable }: { farmerAcc: any, rewardAvailable: number }) => {
  const wallet = useWallet()

  const [rewardRate, setRewardRate] = useState(0)

  useEffect(() => {
    if (farmerAcc && farmerAcc.identity) {
      const rate = farmerAcc.rarityPointsStaked
      setRewardRate(rate)
    }
  }, [farmerAcc, wallet])

  const shortenWalletAddress = (address: string): string => {
    return address.substring(0, 4) + "..." + address.substring(address.length - 4, address.length)
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-evenly", columnGap: "10px" }}>
      <SummaryItem title="Your wallet" value={shortenWalletAddress(wallet.publicKey.toString())} />
      <SummaryItem title="Your Staked Agents" value={`${farmerAcc?.gemsStaked.toNumber()}`} />
      <SummaryItem title="Rewards To Claim" value={`${rewardAvailable} $HAY`} />
      <SummaryItem title="Yielding Rate" value={`${rewardRate} $HAY/day`} />
    </div>
  )
}

const NftGrid2 = (props: {
  title: string,
  nfts: NFT[],
  selectedNfts: NFT[],
  isLocked: boolean,
  handleItemClick: (item: NFT) => void,
  textIfEmpty: string,
}) => {

  const singleItem = (item: NFT) => {
    const isSelected = props.selectedNfts.find(
      (nft) => nft.onchainMetadata.mint === item.onchainMetadata.mint
    )

    return (
      <CollectionItem
        key={item.onchainMetadata.mint}
        item={item}
        onClick={!props.isLocked ? props.handleItemClick : () => true}
        isSelected={isSelected ? true : false}
      />
    )
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <p className="p1"><strong>{props.title}</strong></p>

      {props.nfts && props.nfts.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "start" }}>
          {props.nfts.map((item) => singleItem(item))}
        </div>
      ) : <p className="p1" style={{ fontSize: "18px", fontStyle: "italic" }}>{props.textIfEmpty}</p>
      }
    </div>
  )
}


// const NFTGrid = (props: {
//   title: string,
//   nfts: NFT[],
//   selectedNfts: NFT[],
//   isLocked: boolean,
//   handleItemClick: (item: NFT) => void,
// }) => {

//   return (
//     <div>
//       <NftGridTitle title={props.title} />

//       {props.nfts && props.nfts.length > 0 ? (
//         <div>
//           <Flex
//             sx={{
//               flexDirection: "column",
//               justifyContent: "center",
//               alignSelf: "stretch",
//               alignItems: "center",
//             }}
//           >
//             <div
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns:
//                   props.nfts.length > 1 ? "1fr 1fr" : "1fr",
//                 gap: "1.6rem",

//                 "@media (min-width: 768px)": {
//                   gridTemplateColumns:
//                     props.nfts.length > 9
//                       ? "1fr 1fr 1fr 1fr 1fr 1fr 1fr"
//                       : props.nfts.length > 4
//                         ? "1fr 1fr 1fr 1fr 1fr"
//                         : props.nfts
//                           .map(() => "1fr")
//                           .join(" "),
//                 },
//               }}
//             >
//               {props.nfts.map((item) => {
//                 const isSelected = props.selectedNfts.find(
//                   (NFT) =>
//                     NFT.onchainMetadata.mint === item.onchainMetadata.mint
//                 )

//                 return (
//                   <CollectionItem
//                     key={item.onchainMetadata.mint}
//                     item={item}
//                     onClick={
//                       !props.isLocked ? props.handleItemClick : () => true
//                     }
//                     sx={{
//                       maxWidth: "16rem",
//                       "> img": {
//                         border: "3px solid transparent",
//                         borderColor: isSelected
//                           ? "primary"
//                           : "transparent",
//                       },
//                     }}
//                   />
//                 )
//               })}
//             </div>
//             {/* 
//           {props.selectedNfts && props.selectedNfts.length ? (
//             <>
//               {!props.isLocked ? (
//                 <button
//                   className="button"
//                   onClick={props.handleMoveToWalletButtonClick}>
//                   Withdraw selected
//                 </button>
//               ) : null}
//             </>
//           ) : null} */}
//           </Flex>
//         </div>
//       ) : null}
//     </div>
//   )
// }


const getButtonStyle = (isOn: boolean): any => {
  if (!isOn) {
    return {
      cursor: isOn ? "default" : "not-allowed",
      boxShadow: "-6px 6px 0 0 #000",
    }
  }
}

const MoveButtons = ({ farmState }: { farmState: FarmState }) => {
  if (!farmState) { return <></> }

  return (
    <div style={{ display: "flex", flexDirection: "row", columnGap: "20px" }}>

      <button
        className="button"
        onClick={farmState.handleMoveToVaultButtonClick}
        style={{ width: "60px", ...getButtonStyle(farmState.selectedWalletItems.length > 0) }}
        disabled={farmState.selectedWalletItems.length === 0}
      >
        &darr;
      </button>

      <button
        className="button"
        onClick={farmState.handleMoveToWalletButtonClick}
        style={{ width: "60px", ...getButtonStyle(farmState.selectedVaultItems.length > 0) }}
        disabled={farmState.selectedVaultItems.length === 0}
      >
        &uarr;
      </button>

    </div>

  )
}


const TopButtons = ({ farmState }: { farmState: FarmState }) => {

  const [isStakeButtonOn, setIsStakeButtonOn] = useState(false)
  const [isWhithrawButtonOn, setIsWithdrawButtonOn] = useState(false)

  useEffect(() => {
    const isOn = farmState.farmerVaultNFTs && farmState.farmerVaultNFTs.length > 0
    setIsStakeButtonOn(isOn)
  }, [farmState])

  useEffect(() => {
    const isOn = farmState.availableA && farmState.availableA > 0 && !farmState.isLocked
    setIsWithdrawButtonOn(isOn)
  }, [farmState])

  const handleStakingToggleClick = () => {
    if (isStakeButtonOn) {
      farmState.isLocked ? farmState.handleUnstakeButtonClick() : farmState.handleStakeButtonClick()
    }
  }

  const handleWithdrawClick = () => {
    if (isWhithrawButtonOn) {
      farmState.handleClaimButtonClick()
    }
  }

  if (!farmState) { return <></> }

  return (
    <div style={{ display: "flex", justifyContent: "center", columnGap: "40px" }}>
      <button
        className="button"
        onClick={handleStakingToggleClick}
        style={getButtonStyle(isStakeButtonOn)}
      >
        {farmState.isLocked ? "Unstake" : "Stake"}
      </button>
      <button
        className="button"
        onClick={handleWithdrawClick}
        style={getButtonStyle(isWhithrawButtonOn)}
      >
        Withdraw $HAY
      </button>
    </div>
  )
}


const AccountPage = ({ farmState }: { farmState: FarmState }) => {

  return (
    <div style={{ marginBottom: "50px", marginTop: "20px" }}>
      <AccountSummaryRow
        farmerAcc={farmState.farmerAccount}
        rewardAvailable={farmState.availableA}
      />
      <div style={{ display: "flex", flexDirection: "column", rowGap: "20px", marginTop: "20px", marginBottom: "40px" }}>
        <TopButtons farmState={farmState} />
        <NftGrid2
          title="Your wallet"
          nfts={farmState.walletNFTs}
          selectedNfts={farmState.selectedWalletItems}
          isLocked={farmState.isLocked}
          handleItemClick={farmState.handleWalletItemClick}
          textIfEmpty={"You don't have any Llama Agents."}
        />
        <MoveButtons farmState={farmState} />
        <NftGrid2
          title="Staked Llama Agents"
          nfts={farmState.farmerVaultNFTs}
          selectedNfts={farmState.selectedVaultItems}
          isLocked={farmState.isLocked}
          handleItemClick={farmState.handleVaultItemClick}
          textIfEmpty={"Your vault is empty."}
        />
      </div>
    </div>
  )
}

export default AccountPage
