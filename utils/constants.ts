import * as anchor from '@project-serum/anchor';


export const DEFAULT_TIMEOUT = 15000;

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


export interface SlaCollection {
  id: number,
  name: string,
  collection: string,
  candyMachine: string,
  expression: string,
}

export const SLA_COLLECTIONS: {[name: string]: SlaCollection} = {
  agent: {
    id: 0,
    name: "Llama-Agent",
    collection: "va43C1zLwaSeq54KTFir5KWTUp7kQgg6JLALiTA3dBi",
    candyMachine: "APaYKFd3oJniUf7GAnZ3JdzFDvvFP4bbF51GT6dJmHX7",
    expression: "a new Agent"
  },
  skin: {
    id: 1,
    name: "Skin",
    collection: "12HL4jiRkDry3gd9HssESWUcKUmfLusu1ryqtCeMKQE2",
    candyMachine: "596CUro736DCYQRrRSvqceWvB2xm9NmYWzn9XGYrVAX5",
    expression: "a new Skin"
  },
  clothing: {
    id: 2,
    name: "Clothing",
    collection: "94GkHEUrEn8JB8femCa2DzpdMLaqs8CAMV6s2vVfeg6F",
    candyMachine: "8C23amhiUafSiKjzHDHMF2FWMr5U3y1FTNca7JeCGEan",
    expression: "some new Clothes"
  },
  eyes: {
    id: 3,
    name: "Eyes",
    collection: "6qiRWftfRPhqGDWEbvwm2sFttWGfPnr1EsnLEfvbyUma",
    candyMachine: "3duZdeGAjATA7mP4zDFkcRymRwuj71iVJNzauQGZgoHb",
    expression: "a new pair of Eyes"
  },
  hat: {
    id: 4,
    name: "Hat",
    collection: "2PVhyZ3W2vwFnNLTj8iDZyLXajtt7wYMqiFpAjZGUm1Y",
    candyMachine: "86DqxGnQ1GrpsQojCD9eNR2oY13FL4h8aVTBF4w6wg6E",
    expression: "a new Hat"
  },
  mouth: {
    id: 5,
    name: "Mouth",
    collection: "5AtYVqj4kBg3QqcuWq4tD4mrVZBCb9Fp2SubRJSzit2c",
    candyMachine: "7wfMxZMJ4KeP4v2AW2oZGg5QiAWDnNLRdpttm3K1tNhP",
    expression: "a new Mouth"
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