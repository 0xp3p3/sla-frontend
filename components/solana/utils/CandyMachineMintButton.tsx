import { CandyMachineAccount } from '../../../utils/candy-machine';
import { CircularProgress } from '@material-ui/core';
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';
import React, { useEffect, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import ReactTooltip from 'react-tooltip';


interface Props {
  onMint: () => Promise<void>,
  candyMachine: CandyMachineAccount | null,
  isMinting: boolean,
  setIsMinting: (val: boolean) => void,
  isUserWhitelisted: boolean,
  price: number,
}

export const MintButton = (props: Props) => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { requestGatewayToken, gatewayStatus } = useGateway()

  const cndyState = props.candyMachine?.state
  const [isUserAllowedToClick, setIsUserAllowedToClick] = useState(false)
  const [balance, setBalance] = useState(0.0)

  // Update balance of user
  useEffect(() => {
    if (!(wallet.publicKey && wallet.connected)) { return }

    connection.getBalance(wallet.publicKey).then(balance => {
      setBalance(balance / LAMPORTS_PER_SOL)
    })
  }, [wallet, connection, props.candyMachine])

  // Update whether the user is allowed to click
  useEffect(() => {
    const isAllowed = wallet.connected && cndyState?.isActive && props.isUserWhitelisted && balance >= props.price
    console.log('is allowed:', isAllowed)
    setIsUserAllowedToClick(isAllowed)
  }, [wallet.connected, balance, connection, props.candyMachine, props.isUserWhitelisted])

  const getTooltipContent = () => {
    const walletNotConnected = `⚠️ You have not selected a wallet ⚠️ <br />☝️ Click on 'Connect Wallet' at the top ☝️`
    const notWhitelisted = `Make sure to get whitelisted before the launch!`
    const notEnoughSol = "Oops! Looks like you don't have enough SOL 🥺"
    const waitingForLaunch = "You're on the whitelist! 🎉 Make sure to mark the launch date 🚀"
    const ready = `Click 'Mint' to get your Llama Agent!`

    if (!wallet.publicKey || !wallet.connected) { return walletNotConnected }
    if (!props.isUserWhitelisted) { return notWhitelisted }
    if (balance < props.price) { return notEnoughSol }
    if (!cndyState?.isActive) { return waitingForLaunch }

    return ready
  }

  const previousGatewayStatus = usePrevious(gatewayStatus);
  useEffect(() => {
    const fromStates = [
      GatewayStatus.NOT_REQUESTED,
      GatewayStatus.REFRESH_TOKEN_REQUIRED,
    ]
    const invalidToStates = [...fromStates, GatewayStatus.UNKNOWN]
    if (
      fromStates.find(state => previousGatewayStatus === state) &&
      !invalidToStates.find(state => gatewayStatus === state)
    ) {
      props.setIsMinting(true)
    }
  }, [props.setIsMinting, previousGatewayStatus, gatewayStatus])

  const onClick = async () => {
    if (isUserAllowedToClick) {
      if (cndyState?.gatekeeper) {
        const network = cndyState?.gatekeeper.gatekeeperNetwork.toBase58()
        console.log(`Gatekeeper network: ${network}`)
        if (network === 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6') {
          if (gatewayStatus === GatewayStatus.ACTIVE) {
            await props.onMint()
          } else {
            console.log(`Requesting a Gateway Token (and minting just after!)`)
            await requestGatewayToken()
            await props.onMint()
          }
        } else {
          console.log(`Unknown Gatekeeper Network: ${network}`)
        }
      } else {
        console.log(`Minting without gatekeeper required`)
        await props.onMint()
      }
    } else {
      console.log(`User cannot mint`)
    }
  }

  const [buttonStyle, setButtonStyle] = useState({})
  useEffect(() => {
    setButtonStyle(isUserAllowedToClick ? {} : { cursor: 'not-allowed', boxShadow: '-6px 6px 0 0 #000' })
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

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
