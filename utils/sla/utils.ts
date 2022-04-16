import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { web3 } from '@project-serum/anchor';
import * as spl_token from '@solana/spl-token';
import * as mpl_metadata from '@metaplex-foundation/mpl-token-metadata';
import { TOKEN_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from '../constants';
import solana_config from '../../../sla-config/solana/config.json';

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

export async function checkAvatarBelongsToSLA(
  avatarMint: web3.PublicKey,
  connection: anchor.web3.Connection,
  solanaNetwork: string,
): Promise<boolean> {

  const metadata = await mpl_metadata.Metadata.getPDA(avatarMint)
  const metadataData = new mpl_metadata.Metadata(
    metadata, await mpl_metadata.Metadata.getInfo(connection, metadata)
  ).data

  console.log(metadataData)

  // Check that the Candy Machine Treasury wallet is part of the
  // verified creators
  const isSlaCreatorPresent = metadataData.data.creators.filter(
    creator => (
      creator.address === solana_config.wallets.collectionsCreator
      && creator.verified
    )
  ).length == 1
  console.log(`isSlaCreatorPresent: ${isSlaCreatorPresent}`)

  // Check that the other verified creator is the Candy Machine PDA
  const isCandyMachinePdaCreatorPresent = metadataData.data.creators.filter(
    creator => (
      creator.address == solana_config[solanaNetwork].candyMachines.llamaAgent.creatorKey
      && creator.verified
    )
  ).length == 1
  console.log(`isCandyMachineCreatorPresent: ${isCandyMachinePdaCreatorPresent}`)

  // Check that it belongs to the SLA LlamaAgent collection
  const isFromCollection = (
    metadataData.collection.verified &&
    metadataData.collection.key == solana_config[solanaNetwork].candyMachines.llamaAgent.collectionKey
  )
  console.log(`isFromCollection: ${isFromCollection}`)

  return isSlaCreatorPresent && isCandyMachinePdaCreatorPresent && isFromCollection
}


export async function getHayBalance(
  userWallet: PublicKey,
  connection: anchor.web3.Connection,
  solanaNetwork: string,
): Promise<number> {

  const hayMint = new PublicKey(solana_config[solanaNetwork].hay.mint)
  const tokenAccount = await findAssociatedTokenAddress(
    userWallet, hayMint
  )
  const response = await connection.getTokenAccountBalance(tokenAccount)
  return parseInt(response.value.amount)
}


export function getIncreaseBudgetInstruction(): web3.TransactionInstruction {
  const data = Buffer.from(
    Uint8Array.of(0, ...new anchor.BN(256000).toArray("le", 4))
  )
  
  return new anchor.web3.TransactionInstruction({
    keys: [],
    programId: new PublicKey("ComputeBudget111111111111111111111111111111"),
    data,
  })
}


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