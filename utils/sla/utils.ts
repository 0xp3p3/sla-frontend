import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../constants';

export function isThisTheAvatarCandyMachine(
  candyMachineAddress: PublicKey,
): boolean {
  switch (candyMachineAddress.toString()) {
    case process.env.NEXT_PUBLIC_CM_ID_AVATAR!: return true;
    case process.env.NEXT_PUBLIC_CM_ID_CLOTHES!: return false;
    case process.env.NEXT_PUBLIC_CM_ID_EYES!: return false;
    case process.env.NEXT_PUBLIC_CM_ID_HAT!: return false;
    case process.env.NEXT_PUBLIC_CM_ID_MOUTH!: return false;
    default: Error("The Candy Machine address doesn't match any");
  }
  return false;
}

export async function getProvider(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet,
  ): Promise<anchor.Provider> {
  return new anchor.Provider(
    connection, wallet, anchor.Provider.defaultOptions(),
  );
}

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


export async function signWithAnchorWalletAndSendTransaction(
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: AnchorWallet,
): Promise<string> {

    transaction.feePayer = wallet.publicKey
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash
    const signedTx = await wallet.signTransaction(transaction)
  
    return await connection.sendRawTransaction(signedTx.serialize())
}