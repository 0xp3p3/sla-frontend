import * as web3 from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { AnchorWallet } from "@solana/wallet-adapter-react";
import * as spl_token from '@solana/spl-token';
import { PublicKey } from "@solana/web3.js";
import { findAssociatedTokenAddress, getProvider } from "./utils";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as mpl_metadata from '@metaplex-foundation/mpl-token-metadata';

import idl from '../../sla_idl.json';
import { TOKEN_PROGRAM_ID } from '../constants';
import { generateSlaMasterPda, generateSlaNftPda } from './accounts';
import solana_config from '../../../sla-config/solana/config.json';
import { getIncreaseBudgetInstruction } from './utils';


export async function mintTraitWhitelistToken(
  avatarMint: PublicKey,
  whitelistMint: PublicKey,
  wallet: AnchorWallet,
  connection: anchor.web3.Connection,
  traitId: number,
): Promise<string> {

  const provider = await getProvider(connection, wallet)

  // @ts-ignore
  const program = new anchor.Program(idl, solana_config.program.id, provider)

  const avatarTokenAccount = findAssociatedTokenAddress(wallet.publicKey, avatarMint)
  const [avatarPda, avatarBump] = await generateSlaNftPda(avatarMint)

  const [slaMasterPda, masterBump] = await generateSlaMasterPda()
  const whitelistToken = findAssociatedTokenAddress(wallet.publicKey, whitelistMint)

  return program.rpc.mintTraitWhitelistToken(
    avatarBump, masterBump, new anchor.BN(traitId), {
      accounts: {
        avatar: avatarPda,
        avatarMint: avatarMint,
        avatarToken: await avatarTokenAccount,
        slaMasterPda: slaMasterPda,
        whitelistToken: await whitelistToken,
        whitelistMint: whitelistMint,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      }
    }
  )
}

export async function mintIDCard(
  wallet: AnchorWallet,
  connection: web3.Connection,
  network: string,
): Promise<string> {
  const provider = await getProvider(connection, wallet)
  // @ts-ignore
  const program = new anchor.Program(idl, solana_config.program.id, provider)

  const hayMint = new PublicKey(solana_config[network].hay.mint)
  const hayUserAta = await findAssociatedTokenAddress(
    wallet.publicKey, hayMint
  )

  const hayTreasuryAta = await findAssociatedTokenAddress(
    new PublicKey(solana_config.wallets.hayTreasury), hayMint
  )

  const newMint = anchor.web3.Keypair.generate()
  const newMetadata = await mpl_metadata.Metadata.getPDA(
    newMint.publicKey
  )
  const newEdition = await mpl_metadata.Edition.getPDA(
    newMint.publicKey
  )
  const newAta = await findAssociatedTokenAddress(
    wallet.publicKey, newMint.publicKey
  )

  const masterEditionMint = new PublicKey(solana_config[network].idCard.mint)
  const masterEdition = await mpl_metadata.MasterEdition.getPDA(
    masterEditionMint
  )
  const masterMetadata = await mpl_metadata.Metadata.getPDA(
    masterEditionMint
  )
  const masterAta = await findAssociatedTokenAddress(
    new PublicKey(solana_config.wallets.collectionsCreator), masterEditionMint
  )
  
  const currentSupply = new mpl_metadata.MasterEdition(
    masterEdition, await mpl_metadata.MasterEdition.getInfo(connection, masterEdition)
  ).data.supply
  console.log(`currentSupply: ${currentSupply.toNumber()}`)

  const editionNumber = currentSupply.add(new anchor.BN(1))
  const editionMarkPda = await mpl_metadata.EditionMarker.getPDA(
    masterEditionMint, editionNumber
  )

  const [treasury, treasuryBump] = await PublicKey.findProgramAddress(
    [Buffer.from(solana_config.program.seeds.treasury)],
    new anchor.web3.PublicKey(solana_config.program.id)
  )

  console.log(`hayMint: ${hayMint.toString()}`)
  console.log(`hayUserATA: ${hayUserAta.toString()}`)
  console.log(`hayTreasuryAta: ${hayTreasuryAta.toString()}`)
  console.log(`newMetadata: ${newMetadata.toString()}`)
  console.log(`newEdition: ${newEdition.toString()}`)
  console.log(`newMint: ${newMint.publicKey.toString()}`)
  console.log(`newATA: ${newAta.toString()}`)
  console.log(`editionMarker: ${editionMarkPda.toString()}`)
  console.log(`masterEdition: ${masterEdition}`)
  console.log(`masterMetadata: ${masterMetadata.toString()}`)
  console.log(`masterMint: ${masterEditionMint.toString()}`)
  console.log(`masterAta: ${masterAta.toString()}`)
  console.log(`user: ${wallet.publicKey.toString()}`)
  console.log(`treasury: ${treasury.toString()}`)

  // ID Card is 1
  const tokenType = 1

  const transaction = new anchor.web3.Transaction()

  // Increase the compute budget
  const data = Buffer.from(
    Uint8Array.of(0, ...new anchor.BN(256000).toArray("le", 4))
  );
  transaction.add(
    new web3.TransactionInstruction({
      keys: [],
      programId: new PublicKey("ComputeBudget111111111111111111111111111111"),
      data,
    })
  )
  
  // Mint a new edition
  transaction.add(
    program.instruction.mintEdition(
      masterEditionMint, new anchor.BN(treasuryBump), editionNumber, tokenType, {
        accounts: {
          hayMint,
          hayUserAta,
          hayTreasuryAta,
          newMetadata,
          newEdition, 
          newMint: newMint.publicKey, 
          newAta, 
          editionMarker: editionMarkPda,
          masterEdition, 
          masterMetadata,
          masterAta,
          user: wallet.publicKey,
          treasury,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          tokenProgram: spl_token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: spl_token.ASSOCIATED_TOKEN_PROGRAM_ID,
          mplTokenMetadataProgram: mpl_metadata.MetadataProgram.PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        }, 
        signers: [newMint],
      }
    )
  )
  
  // Sign the transaction
  transaction.feePayer = wallet.publicKey
  const blockhash = await connection.getRecentBlockhash()
  transaction.recentBlockhash = blockhash.blockhash
  const signedTx = await wallet.signTransaction(transaction)

  console.log(signedTx.verifySignatures())

  return await connection.sendRawTransaction(signedTx.serialize())
}