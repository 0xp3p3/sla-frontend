import { CandyMachineAccount } from '../../utils/candy-machine';
import { CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import ReactTooltip from 'react-tooltip';


interface Props {
  onMint: () => Promise<void>,
  candyMachine: CandyMachineAccount | null,
  isMinting: boolean,
  isUserWhitelisted: boolean,
  isUserAllowedToClick: boolean,
  balance: number,
  price: number,
}

export const MintButton = (props: Props) => {
  const wallet = useWallet()

  const cndyState = props.candyMachine?.state

  const getTooltipContent = () => {
    const walletNotConnected = `⚠️ You have not selected a wallet ⚠️ <br />☝️ Click on 'Connect Wallet' at the top ☝️`
    const notWhitelisted = `Make sure to get whitelisted before the launch!`
    const notEnoughSol = "Oops! Looks like you don't have enough SOL 🥺"
    const waitingForLaunch = "You're on the whitelist! 🎉 Make sure to mark the launch date 🚀"
    const ready = `Click 'Mint' to get your Llama Agent!`

    if (!wallet.publicKey || !wallet.connected) { return walletNotConnected }
    if (!props.isUserWhitelisted) { return notWhitelisted }
    if (props.balance < props.price) { return notEnoughSol }
    if (!cndyState?.isActive) { return waitingForLaunch }

    return ready
  }

  const onClick = async () => {
    if (props.isUserAllowedToClick) {
      return props.onMint()
    } else {
      console.log('User is not allowed to mint.')
    }
  }

  const [buttonStyle, setButtonStyle] = useState({})
  useEffect(() => {
    setButtonStyle(props.isUserAllowedToClick ? {} : { cursor: 'not-allowed', boxShadow: '-6px 6px 0 0 #000' })
  }, [cndyState, props.isUserWhitelisted])

  return (
    <>
      <button
        className='button mint w-button'
        onClick={onClick}
        data-tip={getTooltipContent()}
        style={buttonStyle}
      >
        {cndyState?.isSoldOut ? 'SOLD OUT' : (props.isMinting ? <CircularProgress /> : `MINT (${props.price} SOL)`)}
      </button >
      <ReactTooltip className='mint-tooltip' multiline place="right" type="info" effect="solid" />
    </>
  );
};
