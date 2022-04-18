import { CandyMachineAccount } from '../../../utils/candy-machine';
import { CircularProgress } from '@material-ui/core';
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';
import React, { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import ReactTooltip from 'react-tooltip';



interface Props {
  onMint: () => Promise<void>,
  candyMachine: CandyMachineAccount | null,
  isMinting: boolean,
  setIsMinting: (val: boolean) => void,
  isUserWhitelisted: boolean,
  price: string,
}

export const MintButton = (props: Props) => {
  const wallet = useWallet()
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const cndyState = props.candyMachine?.state

  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    setIsLive(cndyState?.goLiveDate?.toNumber() < new Date().getTime() / 1000)
  }, [props.candyMachine, wallet])

  const getMintButtonContent = () => {
    if (cndyState?.isSoldOut) {
      return 'SOLD OUT'
    } else if (props.isMinting) {
      return <CircularProgress />
    } else if (cndyState?.isPresale || cndyState?.isWhitelistOnly) {
      return `AL MINT (${props.price})`
    } else {
      return `MINT (${props.price})`
    }
  }

  const getTooltipContent = () => {
    const walletNotConnected = `⚠️ Your have not selected a wallet ⚠️ <br />☝️ Click on 'Connect Wallet' at the top ☝️`
    const notActive = "🎟 Join our Discord for the chance to get a whitelist token! 🎟"
    const ready = "You're all set for minting! 👌"

    if (!wallet.publicKey || !wallet.connected) {
      return walletNotConnected
    } 
    
    if (!isLive) {
      return notActive
    } 
    
    if (cndyState?.isWhitelistOnly) {
      if (!props.isUserWhitelisted) {
        return notActive
      } else {
        return ready
      }
    }
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
    if (cndyState?.isActive) {
      if (cndyState?.gatekeeper) {
        const network = cndyState?.gatekeeper.gatekeeperNetwork.toBase58()
        console.log(`Gatekeeper network: ${network}`)
        if (network === 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6') {
          if (gatewayStatus === GatewayStatus.ACTIVE) {
            await props.onMint();
          } else {
            console.log(`Requesting a Gateway Token (and minting just after!)`)
            await requestGatewayToken();
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

  return (
    <>
      <button
        className='button mint w-button'
        // disabled={props.isMinting || !cndyState?.isActive}
        onClick={onClick}
        data-tip={getTooltipContent()}
        style={ cndyState?.isActive ? {} : {cursor: 'not-allowed'}}
      >
        {getMintButtonContent()}
      </button >
      <ReactTooltip multiline place="bottom" type="info" effect="solid" />
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
