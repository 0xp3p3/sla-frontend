import * as anchor from '@project-serum/anchor';


export const DEFAULT_TIMEOUT = 30000;

export const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);

export const CANDY_MACHINE_PROGRAM = new anchor.web3.PublicKey(
  'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
);

export const SLA_PROGRAM_ID = new anchor.web3.PublicKey(
  "GUSxqUfUdqchfErA3DrW1jNVJKGdMpxt71AeDkJJtG5R"
)

export const CIVIC = new anchor.web3.PublicKey(
  'gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs',
);

export const SLA_ARWEAVE_WALLET = new anchor.web3.PublicKey(
  "JDpq9RP9zUdVShvwwp2DK8orxU8e73SDMsQiYnsK87ga"
);

export const imageSize = { width: 1000, height: 1000 }

export const HAY_MINT = new anchor.web3.PublicKey(
  "CcaKx6adqp8wDeksiR15x8HMgBzjz8QY6pJCmRZQPXAB"
)

export const SLA_HAY_TREASURY_WALLET = new anchor.web3.PublicKey(
  "GYoijtAH31pDLNGz4UYCf5aRGe92iwx7BWv2CZtwUKDC"
)

export const COMBINE_AUTHORITY_WALLET = new anchor.web3.PublicKey(
  "2Pi1TvYf8Nku8ppq3Pn4ZEHDNo8fFhZjcLaRHi17Au4C"
)

export const ARWEAVE_UPLOAD_ENDPOINT = 'https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile';

export const ARWEAVE_PAYMENT_WALLET = new anchor.web3.PublicKey(
  '6FKvsq4ydWFci6nGq9ckbjYMtnmaqAoatz5c9XWjiDuS',
);


export interface SlaCollection {
  id: number,
  name: string,
  collection: string,
  candyMachine: string,
  expression: string,
  supply: number,
  magicEdenUrl: string,
}

export const SLA_COLLECTIONS: {[name: string]: SlaCollection} = {
  agent: {
    id: 0,
    name: "Llama-Agent",
    collection: "GqxAoZaqww9zp6y5RddRhExrwTVySfAjLnheaJVjSvag",
    candyMachine: "CiBuYi3W3aVQbMWcjvfKBpwjHS6fViuuxQdSUUqkjkn4",
    expression: "a new Agent",
    supply: 0,
    magicEdenUrl: "https://www.magiceden.io/marketplace/secret_llama_agency",
  },
  skin: {
    id: 1,
    name: "Skin",
    collection: "12HL4jiRkDry3gd9HssESWUcKUmfLusu1ryqtCeMKQE2",
    candyMachine: "596CUro736DCYQRrRSvqceWvB2xm9NmYWzn9XGYrVAX5",
    expression: "a new Skin",
    supply: 4356,
    magicEdenUrl: "https://www.magiceden.io/marketplace/sla_skin_traits",
  },
  clothing: {
    id: 2,
    name: "Clothing",
    collection: "94GkHEUrEn8JB8femCa2DzpdMLaqs8CAMV6s2vVfeg6F",
    candyMachine: "8C23amhiUafSiKjzHDHMF2FWMr5U3y1FTNca7JeCGEan",
    expression: "some new Clothes",
    supply: 2546,
    magicEdenUrl: "https://www.magiceden.io/marketplace/sla_clothing_traits",
  },
  eyes: {
    id: 3,
    name: "Eyes",
    collection: "6qiRWftfRPhqGDWEbvwm2sFttWGfPnr1EsnLEfvbyUma",
    candyMachine: "3duZdeGAjATA7mP4zDFkcRymRwuj71iVJNzauQGZgoHb",
    expression: "a new pair of Eyes",
    supply: 2500,
    magicEdenUrl: "https://www.magiceden.io/marketplace/sla_eyes_traits",
  },
  hat: {
    id: 4,
    name: "Hat",
    collection: "2PVhyZ3W2vwFnNLTj8iDZyLXajtt7wYMqiFpAjZGUm1Y",
    candyMachine: "86DqxGnQ1GrpsQojCD9eNR2oY13FL4h8aVTBF4w6wg6E",
    expression: "a new Hat",
    supply: 2481,
    magicEdenUrl: "https://www.magiceden.io/marketplace/sla_hat_traits",
  },
  mouth: {
    id: 5,
    name: "Mouth",
    collection: "5AtYVqj4kBg3QqcuWq4tD4mrVZBCb9Fp2SubRJSzit2c",
    candyMachine: "7wfMxZMJ4KeP4v2AW2oZGg5QiAWDnNLRdpttm3K1tNhP",
    expression: "a new Mouth",
    supply: 3500,
    magicEdenUrl: "https://www.magiceden.io/marketplace/sla_mouth_traits",
  }
}

export const AGENT_COLLECTION = SLA_COLLECTIONS.agent.collection;

export const TRAIT_COLLECTIONS = [
  SLA_COLLECTIONS.skin.collection, 
  SLA_COLLECTIONS.clothing.collection,
  SLA_COLLECTIONS.eyes.collection,
  SLA_COLLECTIONS.hat.collection,
  SLA_COLLECTIONS.mouth.collection,
]

export const ID_CARD_MINT = new anchor.web3.PublicKey(
  "9mxy4zbRkb4CJbWz3cyjgVas3ok9dqdAZPWHQD34o2Jo"
)

export const SCANNER_MINT = new anchor.web3.PublicKey(
  "D2RDTgj4HPKq6k6Fqz9cQBHbLv7NHT6gQEtuH3kfNC3m"
)

export enum SLA_TOKEN_TYPE {
  AGENT,
  TRAIT, 
  ID_CARD,
  BADGE,
  SCANNER,
}

export interface SlaBadge {
  id: number,
  name: string,
  expression: string,
  supply: number,
  bonusHay: number,
  mint: string,
  price: number,
}

export const SLA_BADGES: SlaBadge[] = [
  {
    id: 2,
    name: "Bronze",
    expression: "a Bronze Badge",
    supply: 3000,
    bonusHay: 5,
    mint: "AxJohkM2mvtXzkSf6oLy4NjXtrvJUehiMAPjsJ6V1S1u",
    price: 60,
  },
  {
    id: 3,
    name: "Silver",
    expression: "a Silver Badge",
    supply: 2100,
    bonusHay: 7,
    mint: "HVXkw7SaH3i1KKhisgVfE8meUpdawyo6BtjX1YvRCEHL",
    price: 150,
  },
  {
    id: 4,
    name: "Gold",
    expression: "a Gold Badge",
    supply: 1350,
    bonusHay: 9,
    mint: "6MsxoFAhvfL4DcYniQ4FoMdhaRATgzkG1XwyNdLKeMc2",
    price: 210,
  },
  {
    id: 5,
    name: "Platinum",
    expression: "a Platinum Badge",
    supply: 750,
    bonusHay: 11,
    mint: "HZktv6wRgAaLJSoGsXcEhZbJaH6CsmFnuXLbZ93h8LZt",
    price: 405,
  },
  {
    id: 6,
    name: "Diamond",
    expression: "a Diamond Badge",
    supply: 300,
    bonusHay: 15,
    mint: "gQrMXw5EpWVmiikvapTxcHGuaDH3NYbTJwC9voyqfFG",
    price: 660,
  }
]

export const SLA_BRONZE_BADGE = SLA_BADGES.filter(badge => badge.id === 2)[0]
export const SLA_SILVER_BADGE = SLA_BADGES.filter(badge => badge.id === 3)[0]
export const SLA_GOLD_BADGE = SLA_BADGES.filter(badge => badge.id === 4)[0]
export const SLA_PLATINUM_BADGE = SLA_BADGES.filter(badge => badge.id === 5)[0]
export const SLA_DIAMOND_BADGE = SLA_BADGES.filter(badge => badge.id === 6)[0]