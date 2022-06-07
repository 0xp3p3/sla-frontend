import { PublicKey } from '@solana/web3.js';
import { CIVIC } from './constants';


export const getNetworkExpire = async (
  gatekeeperNetwork: PublicKey,
): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [gatekeeperNetwork.toBuffer(), Buffer.from('expire')],
    CIVIC,
  );
};

export const getNetworkToken = async (
  wallet: PublicKey,
  gatekeeperNetwork: PublicKey,
): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [
      wallet.toBuffer(),
      Buffer.from('gateway'),
      Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
      gatekeeperNetwork.toBuffer(),
    ],
    CIVIC,
  );
};