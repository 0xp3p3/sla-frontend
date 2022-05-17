import { useWallet } from "@solana/wallet-adapter-react"
import { NFT } from "../../hooks/useWalletNFTs";
import CollectionItem from "./CollectionItem";
import SummaryItem from "./SummaryItem";
import { FarmState } from "../../hooks/useGemFarmStaking";
import { useEffect, useState } from "react";
import { Spinner } from "theme-ui"


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


const getButtonStyle = (isOn: boolean): any => {
  if (!isOn) {
    return {
      cursor: isOn ? "default" : "not-allowed",
      boxShadow: "-6px 6px 0 0 #000",
    }
  }
}

const MoveButtons = ({ farmState }: { farmState: FarmState }) => {
  
  const [isMovingToWallet, setIsMovingToWallet] = useState(false)
  const [isMovingToVault, setIsMovingToVault] = useState(false)
  
  if (!farmState) { return <></> }

  const handleMoveToWallet = async () => {
    try {
      setIsMovingToWallet(true)
      await farmState.handleMoveToWalletButtonClick()
    } catch (error: any) {
      console.log('Failed to move NFTs to wallet', error)
    } finally {
      setIsMovingToWallet(false)
    }
  }

  const handleMoveToVault = async () => {
    try {
      setIsMovingToVault(true)
      await farmState.handleMoveToVaultButtonClick()
    } catch (error: any) {
      console.log('Failed to move NFTs to vault', error)
    } finally {
      setIsMovingToVault(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", columnGap: "20px" }}>

      <button
        className="button"
        onClick={handleMoveToVault}
        style={{ width: "60px", ...getButtonStyle(farmState.selectedWalletItems.length > 0) }}
        disabled={farmState.selectedWalletItems.length === 0}
      >
        { isMovingToVault ? <Spinner /> : "\u2193" }
      </button>

      <button
        className="button"
        onClick={handleMoveToWallet}
        style={{ width: "60px", ...getButtonStyle(farmState.selectedVaultItems.length > 0) }}
        disabled={farmState.selectedVaultItems.length === 0}
      >
        { isMovingToVault ? <Spinner /> : '\u2191' }
      </button>

    </div>

  )
}


const TopButtons = ({ farmState }: { farmState: FarmState }) => {

  const [isStakeButtonOn, setIsStakeButtonOn] = useState(false)
  const [isWhithrawButtonOn, setIsWithdrawButtonOn] = useState(false)
  
  const [isTogglingStaking, setIsTogglingStaking] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    const isOn = farmState.farmerVaultNFTs && farmState.farmerVaultNFTs.length > 0
    setIsStakeButtonOn(isOn)
  }, [farmState])

  useEffect(() => {
    const isOn = farmState.availableA && farmState.availableA > 0
    setIsWithdrawButtonOn(isOn)
  }, [farmState])

  const handleStakingToggleClick = async () => {
    try {
      setIsTogglingStaking(true)
      if (isStakeButtonOn) {
        farmState.isLocked ? await farmState.handleUnstakeButtonClick() : await farmState.handleStakeButtonClick()
      }
    } catch (error: any) {
      console.log('Failed to toggle staking', error)
    } finally {
      setIsTogglingStaking(false)
    }
  }

  const handleWithdrawClick = async () => {
    try {
      setIsWithdrawing(true)
      if (isWhithrawButtonOn) {
        await farmState.handleClaimButtonClick()
      }
    } catch (error: any) {
      console.log('Failed to withdraw rewards', error)
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleRefreshAccountClick = async () => {
    try {
      setIsRefreshing(true)
      await farmState.handleRefreshRewardsButtonClick()
    } catch (error: any) {
      console.log(`Failed to refresh account`, error)
    } finally {
      setIsRefreshing(false)
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
        { isTogglingStaking ? <Spinner /> : (farmState.isLocked ? "Unstake" : "Stake") }
      </button>
      <button
        className="button"
        onClick={handleRefreshAccountClick}
        style={getButtonStyle(true)}
      >
        { isRefreshing ? <Spinner /> : "Refresh Account" }
      </button>
      <button
        className="button"
        onClick={handleWithdrawClick}
        style={getButtonStyle(isWhithrawButtonOn)}
      >
        { isWithdrawing ? <Spinner /> : "Withdraw $HAY" }
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
