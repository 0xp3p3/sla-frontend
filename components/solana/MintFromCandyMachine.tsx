import { PublicKey } from '@solana/web3.js';
import CandyMachine from './utils/CandyMachine';

interface Props {
  readonly candyMachinePubkey: PublicKey,
  readonly collectionMint: PublicKey,
  readonly rpcUrl: string
}

const MintFromCandyMachine = (props: Props) => {

  return (
    <>
      <CandyMachine
        candyMachineId={props.candyMachinePubkey}
        candyMachineCollection={props.collectionMint}
        rpcUrl={props.rpcUrl}
      />
    </>
  )
}

export default MintFromCandyMachine