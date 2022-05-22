import * as anchor from '@project-serum/anchor';
import { MintLayout, TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { SystemProgram, Transaction, SYSVAR_SLOT_HASHES_PUBKEY } from '@solana/web3.js';
import * as mpl from "@metaplex/js";

import { sendTransactions } from './transaction';
import { findAssociatedTokenAddress } from './token';
import { getNetworkExpire, getNetworkToken } from './civic';
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, CIVIC, TOKEN_METADATA_PROGRAM_ID, CANDY_MACHINE_PROGRAM } from "./constants";


interface CandyMachineState {
  authority: anchor.web3.PublicKey;
  itemsAvailable: number;
  itemsRedeemed: number;
  itemsRemaining: number;
  treasury: anchor.web3.PublicKey;
  tokenMint: anchor.web3.PublicKey;
  isSoldOut: boolean;
  isActive: boolean;
  goLiveDate: anchor.BN;
  price: anchor.BN;
  gatekeeper: null | {
    expireOnUse: boolean;
    gatekeeperNetwork: anchor.web3.PublicKey;
  };
  endSettings: null | {
    number: anchor.BN;
    endSettingType: any;
  };
  whitelistMintSettings: null | {
    mode: any;
    mint: anchor.web3.PublicKey;
    presale: boolean;
    discountPrice: null | anchor.BN;
  };
  retainAuthority: boolean;
}

export interface CandyMachineAccount {
  id: anchor.web3.PublicKey;
  program: anchor.Program;
  state: CandyMachineState;
}


const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey,
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([]),
  });
};

export const getCandyMachineState = async (
  anchorWallet: anchor.Wallet,
  candyMachineId: anchor.web3.PublicKey,
  connection: anchor.web3.Connection,
): Promise<CandyMachineAccount> => {
  const provider = new anchor.Provider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);

  const program = new anchor.Program(idl!, CANDY_MACHINE_PROGRAM, provider);

  const state: any = await program.account.candyMachine.fetch(candyMachineId);
  state.itemsAvailable = state.data.itemsAvailable.toNumber();
  state.itemsRedeemed = state.itemsRedeemed.toNumber();
  state.itemsRemaining = state.itemsAvailable - state.itemsRedeemed

  // Has the `goLiveDate` passed?
  const currentTime = new Date().getTime() / 1000
  let isActive = state.data.goLiveDate?.toNumber() < currentTime

  // Has the `endDate` passed?
  if (state.data.endSettings?.endSettingType.date) {
    if (state.data.endSettings.number.toNumber < currentTime) {
      isActive = false
    }
  }

  // Check that the maximum number of items have not been minted
  let isSoldOut = false
  if (state.data.endSettings?.endSettingType.amount) {
    let limit = Math.min(state.data.endSettings.number.toNumber(), state.itemsAvailable)
    if (state.itemsRedeemed < limit) {
      state.itemsRemaining = limit - state.itemsRedeemed
    } else {
      state.itemsRemaining = 0
      isSoldOut = true
    }
  }

  // If there's no item remaining, we're sold out
  if (state.itemsRemaining === 0) {
    isSoldOut = true
  }

  // The Candy Machine is no longer active if it's sold-out
  if (isSoldOut) {
    isActive = false
  }

  return {
    id: candyMachineId,
    program,
    state: {
      authority: state.authority,
      itemsAvailable: state.itemsAvailable,
      itemsRedeemed: state.itemsRedeemed,
      itemsRemaining: state.itemsRemaining,
      isSoldOut,
      isActive,
      goLiveDate: state.data.goLiveDate,
      treasury: state.wallet,
      tokenMint: state.tokenMint,
      gatekeeper: state.data.gatekeeper,
      endSettings: state.data.endSettings,
      whitelistMintSettings: state.data.whitelistMintSettings,
      price: state.data.price,
      retainAuthority: state.data.retainAuthority,
    },
  };
};


export const mintOneToken = async (
  candyMachine: CandyMachineAccount,
  collectionMint: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  beforeTransactions: Transaction[] = [],
  afterTransactions: Transaction[] = [],
): Promise<(string | undefined)[]> => {
  const mint = anchor.web3.Keypair.generate();

  const userTokenAccountAddress = (
    await findAssociatedTokenAddress(payer, mint.publicKey)
  )[0];

  // The account from which the user is paying (SOL or custom token)
  const userPayingAccountAddress = candyMachine.state.tokenMint
    ? (await findAssociatedTokenAddress(payer, candyMachine.state.tokenMint))[0]
    : payer;

  const candyMachineAddress = candyMachine.id;
  const remainingAccounts = [];
  const instructions = [];
  const signers: anchor.web3.Keypair[] = [];
  
  signers.push(mint)
  instructions.push(
    ...[
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports:
          await candyMachine.program.provider.connection.getMinimumBalanceForRentExemption(
            MintLayout.span,
          ),
        programId: TOKEN_PROGRAM_ID,
      }),
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        0,
        payer,
        payer,
      ),
      createAssociatedTokenAccountInstruction(
        userTokenAccountAddress,
        payer,
        payer,
        mint.publicKey,
      ),
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        userTokenAccountAddress,
        payer,
        [],
        1,
      ),
    ],
  )


  // Add accounts needed if using a Gatekeeper
  if (candyMachine.state.gatekeeper) {
    remainingAccounts.push({
      pubkey: (
        await getNetworkToken(
          payer,
          candyMachine.state.gatekeeper.gatekeeperNetwork,
        )
      )[0],
      isWritable: true,
      isSigner: false,
    });

    if (candyMachine.state.gatekeeper.expireOnUse) {
      remainingAccounts.push({
        pubkey: CIVIC,
        isWritable: false,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: (
          await getNetworkExpire(
            candyMachine.state.gatekeeper.gatekeeperNetwork,
          )
        )[0],
        isWritable: false,
        isSigner: false,
      });
    }
  }

  // Add accounts and instructions needed if using a whitelist token
  if (candyMachine.state.whitelistMintSettings) {
    const mint = new anchor.web3.PublicKey(
      candyMachine.state.whitelistMintSettings.mint,
    );

    const whitelistToken = (await findAssociatedTokenAddress(payer, mint))[0];
    remainingAccounts.push({
      pubkey: whitelistToken,
      isWritable: true,
      isSigner: false,
    });

    if (candyMachine.state.whitelistMintSettings.mode.burnEveryTime) {
      remainingAccounts.push({
        pubkey: mint,
        isWritable: true,
        isSigner: false,
      });
      remainingAccounts.push({
        pubkey: payer,
        isWritable: false,
        isSigner: true,
      });
    }
  }

  // Add the accounts and instructions needed to pay using a custom token
  if (candyMachine.state.tokenMint) {
    remainingAccounts.push({
      pubkey: userPayingAccountAddress,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: payer,
      isWritable: false,
      isSigner: true,
    });
  }

  // Get PDAs for the Metadata and Master Edition of the new NFT
  const metadataAddress = await mpl.programs.metadata.Metadata.getPDA(mint.publicKey)
  const masterEdition = await mpl.programs.metadata.MasterEdition.getPDA(mint.publicKey)

  // Get the publickey of the candy machine first creator
  const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(
    candyMachineAddress,
  );

  // Add the main Candy Machine minting instruction
  console.log(remainingAccounts.map(rm => rm.pubkey.toBase58()));
  instructions.push(
    await candyMachine.program.instruction.mintNft(creatorBump, {
      accounts: {
        candyMachine: candyMachineAddress,
        candyMachineCreator,
        payer: payer,
        wallet: candyMachine.state.treasury,
        mint: mint.publicKey,
        metadata: metadataAddress,
        masterEdition,
        mintAuthority: payer,
        updateAuthority: payer,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
        instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      },
      remainingAccounts:
        remainingAccounts.length > 0 ? remainingAccounts : undefined,
    }),
  );

  // Add the instruction to set the collection on this new NFT
  const [collectionPDA] = await getCollectionPDA(candyMachineAddress);
  const collectionPDAAccount = await candyMachine.program.provider.connection.getAccountInfo(collectionPDA);

  if (collectionPDAAccount && candyMachine.state.retainAuthority) {
    try {
      const collectionAuthorityRecord = await getCollectionAuthorityRecordPDA(
        collectionMint,
        collectionPDA,
      );
      console.log(`collectionMint: ${collectionMint.toString()}`);
      if (collectionMint) {
        const collectionMetadata = await mpl.programs.metadata.Metadata.getPDA(collectionMint);
        const collectionMasterEdition = await mpl.programs.metadata.MasterEdition.getPDA(collectionMint)
        console.log('Collection PDA: ', collectionPDA.toBase58());
        console.log('Authority: ', candyMachine.state.authority.toBase58());
        instructions.push(
          await candyMachine.program.instruction.setCollectionDuringMint({
            accounts: {
              candyMachine: candyMachineAddress,
              metadata: metadataAddress,
              payer: payer,
              collectionPda: collectionPDA,
              tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
              instructions: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
              collectionMint,
              collectionMetadata,
              collectionMasterEdition,
              authority: candyMachine.state.authority,
              collectionAuthorityRecord,
            },
          }),
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  try {
    return (
      await sendTransactions(
        candyMachine.program.provider.connection,
        candyMachine.program.provider.wallet,
        [instructions],
        [signers],
        'singleGossip',
        beforeTransactions,
        afterTransactions,
      )
    ).txs;
  } catch (e) {
    console.log(e);
  }

  return [];
};

export const getCandyMachineCreator = async (
  candyMachine: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('candy_machine'), candyMachine.toBuffer()],
    CANDY_MACHINE_PROGRAM,
  );
};

export const getCollectionPDA = async (
  candyMachineAddress: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('collection'), candyMachineAddress.toBuffer()],
    CANDY_MACHINE_PROGRAM,
  );
};

export interface CollectionData {
  mint: anchor.web3.PublicKey;
  candyMachine: anchor.web3.PublicKey;
}

export const getCollectionAuthorityRecordPDA = async (
  mint: anchor.web3.PublicKey,
  newAuthority: anchor.web3.PublicKey,
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('collection_authority'),
        newAuthority.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};