import * as anchor from '@project-serum/anchor';


export const DEFAULT_TIMEOUT = 15000;

export const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new anchor.web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export const SLA_ARWEAVE_WALLET = new anchor.web3.PublicKey(
  "JDpq9RP9zUdVShvwwp2DK8orxU8e73SDMsQiYnsK87ga"
);

export const imageSize = { width: 1000, height: 1000 }

export const SLA_COLLECTIONS = {
  agent: {
    id: 0,
    name: "Llama-Agent",
    collection: "va43C1zLwaSeq54KTFir5KWTUp7kQgg6JLALiTA3dBi"
  },
  skin: {
    id: 1,
    name: "Skin",
    collection: "12HL4jiRkDry3gd9HssESWUcKUmfLusu1ryqtCeMKQE2"
  },
  clothing: {
    id: 2,
    name: "Clothing",
    collection: "94GkHEUrEn8JB8femCa2DzpdMLaqs8CAMV6s2vVfeg6F"
  },
  eyes: {
    id: 3,
    name: "Eyes",
    collectin: "6qiRWftfRPhqGDWEbvwm2sFttWGfPnr1EsnLEfvbyUma"
  },
  hat: {
    id: 4,
    name: "Hat",
    collection: "2PVhyZ3W2vwFnNLTj8iDZyLXajtt7wYMqiFpAjZGUm1Y"
  },
  mouth: {
    id: 5,
    name: "Mouth",
    collection: "5AtYVqj4kBg3QqcuWq4tD4mrVZBCb9Fp2SubRJSzit2c"
  }
}

export const AGENT_COLLECTION = SLA_COLLECTIONS.agent.collection;

export const TRAIT_COLLECTIONS = [
  SLA_COLLECTIONS.skin.collection, 
  SLA_COLLECTIONS.clothing.collection,
  SLA_COLLECTIONS.eyes.collectin,
  SLA_COLLECTIONS.hat.collection,
  SLA_COLLECTIONS.mouth.collection,
]