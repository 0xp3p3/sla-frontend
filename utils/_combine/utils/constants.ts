import * as anchor from '@project-serum/anchor';

export const NODE_SERVER_URL = 'http://sla-backend-dev.eu-west-2.elasticbeanstalk.com/'

export const SYSVAR_SLOT_HASHES_PUBKEY = new anchor.web3.PublicKey(
  'SysvarS1otHashes111111111111111111111111111',
);

export const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
);

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

export const DEFAULT_TIMEOUT = 30000;

export const ARWEAVE_PAYMENT_WALLET = new anchor.web3.PublicKey(
  '6FKvsq4ydWFci6nGq9ckbjYMtnmaqAoatz5c9XWjiDuS',
);

export const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const SLA_PDA_SEED = 'sla_main';
export const SLA_PROGRAM_ID = new anchor.web3.PublicKey(
  '2sochV4HLApPhUPHTYZstZDVdfkxQC1MUyrTVU6TSAxj'
);
export const SLA_TREASURY_WALLET = new anchor.web3.PublicKey(
  "5JTEZn8o81DgXbPMPJmNuMBYASsE1e8HHBqnCVnZqgnR"
);
export const SLA_ARWEAVE_WALLET = new anchor.web3.PublicKey(
  "JDpq9RP9zUdVShvwwp2DK8orxU8e73SDMsQiYnsK87ga"
);

export interface SLA_Trait {
  id: number,
  name: string,
  whitelistMint: string
}

export const SLA_TRAITS = {
  skin: {
    id: 2,
    name: "skin",
    whitelistMint: "HF2uth4uW4kaj93oXQdsCavrQ4wP1GfNqsVky7Fu6Gjx"
  },
  clothing: {
    id: 3,
    name: "clothing",
    whitelistMint: "6Xz1MpEuQQbFpRWEdyLz5oNbHdYQ1KvpyADRu5Qnw6dD"
  },
  eyes: {
    id: 4,
    name: "eyes",
    whitelistMint: "DLkpd8L37Wi62aSbxVToWLMpDw9E6tw7skdqDZUQu4pq"
  },
  hat: {
    id: 5,
    name: "hat",
    whitelistMint: "8wViTotiM8PiYxWCUCRTioC4QaBWvuCKer96tYmttCGe"
  },
  mouth: {
    id: 6,
    name: "mouth",
    whitelistMint: "E9mZcxwRN3qNpDByVVCySWKb14jTZWRJrYHTH7125H4J"
  }
}

export const SLA_SYMBOL = "SLA";
export const imageSize = { width: 1000, height: 1000 }

export const ARWEAVE_UPLOAD_DEVNET_ENDPOINT =
  'https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile';
