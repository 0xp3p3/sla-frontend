import { web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from './constants';


export const findAssociatedTokenAddress = async function (
  walletAddress: web3.PublicKey,
  tokenMintAddress: web3.PublicKey
): Promise<web3.PublicKey> {
  return (
    await web3.PublicKey.findProgramAddress(
      [
          walletAddress.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0];
};