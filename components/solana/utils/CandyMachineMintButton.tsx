import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { CandyMachineAccount } from '../../../utils/candy-machine';
import { CircularProgress } from '@material-ui/core';
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';
import { useEffect, useRef } from 'react';

export const CTAButton = styled(Button)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`; // add your own styles here

export const MintButton = ({
  onMint,
  candyMachine,
  isMinting,
  setIsMinting,
  isActive,
}: {
  onMint: () => Promise<void>;
  candyMachine?: CandyMachineAccount;
  isMinting: boolean;
  setIsMinting: (val: boolean) => void;
  isActive: boolean;
}) => {
  const { requestGatewayToken, gatewayStatus } = useGateway();

  const getMintButtonContent = () => {
    console.log(`isActive: ${isActive}, isPresale: ${candyMachine?.state.isPresale}`)
    if (candyMachine?.state.isSoldOut) {
      return 'SOLD OUT'
    } else if (isMinting) {
      return <CircularProgress />
    } else if (
      candyMachine?.state.isPresale ||
      (candyMachine?.state.isWhitelistOnly && candyMachine?.state.isActive)
    ) {
      return 'WHITELIST MINT'
    } else if (candyMachine?.state.isActive) {
      return 'MINT'
    } else {
      return 'COMING SOON'
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
      setIsMinting(true)
    }
    console.log('Gateway status: ', gatewayStatus)
  }, [setIsMinting, previousGatewayStatus, gatewayStatus])

  return (
    <CTAButton
      disabled={isMinting || !isActive}
      onClick={async () => {
        if (candyMachine?.state.isActive && candyMachine?.state.gatekeeper) {
          const network = candyMachine.state.gatekeeper.gatekeeperNetwork.toBase58()
          console.log(`Gatekeeper network: ${network}`)
          if (network === 'ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6') {
            if (gatewayStatus === GatewayStatus.ACTIVE) {
              await onMint();
            } else {
              console.log(`Requesting a Gateway Token (and minting just after!)`)
              await requestGatewayToken();
            }
          } else {
            throw new Error(`Unknown Gatekeeper Network: ${network}`)
          }
        } else {
          throw new Error(`Candy Mahchine is not live`)
        }
      }}
      variant="contained"
    >
      {getMintButtonContent()}
    </CTAButton>
  );
};

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
