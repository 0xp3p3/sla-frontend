import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { Metadata, MetadataData } from '@metaplex-foundation/mpl-token-metadata';
import * as mpl from '@metaplex/js'

// import solana_config from '../../sla-config/solana/config.json';


export async function getMetadata(
  mint: PublicKey,
  connection: anchor.web3.Connection,
): Promise<Metadata> {
  const metadataKey = await Metadata.getPDA(mint);
  return await Metadata.load(connection, metadataKey);
}

export async function downloadMetadataFromArweave(
  mint: PublicKey,
  connection: anchor.web3.Connection,
): Promise<mpl.MetadataJson> {
  const metadata = getMetadata(mint, connection);
  const uri = (await metadata).data.data.uri;
  return mpl.utils.metadata.lookup(uri);
}

// export async function findCollectionMembersByOwner(
//   owner: PublicKey,
//   connection: anchor.web3.Connection,
//   collectionMint: PublicKey,
// ): Promise<MetadataData[]> {
  
//   // Get all Metadata associated with the user tokens
//   const allData = (await (Metadata.findDataByOwner(connection, owner)))

//   // Filter the tokens to keep only those that come from the collection
//   const collectionMembers = allData
//     .filter(d => d.collection?.key === collectionMint.toString())
//     .filter(d => d.collection.verified)
//     .filter(d => d.data.creators?.map(c => c.address)
//       .includes(solana_config.wallets.collectionsCreator)
//     )
  
//   return collectionMembers;
// }

// export async function finsLlamaAgentsByOwner(
//   owner: PublicKey,
//   connection: anchor.web3.Connection,
//   network: string
// ): Promise<MetadataData[]> {
//   const collectionMint = solana_config[network].llamaAgent.collectionMint
//   return findCollectionMembersByOwner(owner, connection, collectionMint)
// }

// export async function findTraitsByOwner(
//   owner: PublicKey,
//   connection: anchor.web3.Connection,
//   network: string,
// ): Promise<Map<string, MetadataData[]>> {
//   console.log(`Network`)

//   // Trait collections
//   const collections = {
//     "Clothing": solana_config[network].clothingTrait.collectionMint,
//     "Eyes": solana_config[network].eyesTrait.collectionMint,
//     "Hats": solana_config[network].hatTrait.collectionMint,
//     "Mouths": solana_config[network].mouthTrait.collectionMint,
//     "Skins": solana_config[network].skinTrait.collectionMint
//   }

//   let traits = new Map<string, MetadataData[]>()
//   for (const [trait, collection] of Object.entries(collections)) {
//     const all = await findCollectionMembersByOwner(owner, connection, collection)
//     traits.set(trait, all)
//   }

//   return traits;
// }

export async function getImageLink(
  metadata_uri: string,
): Promise<string> {
  return (await mpl.utils.metadata.lookup(metadata_uri)).image
}

export function createNewAvatarMetadata(
  avatarJson: mpl.MetadataJson,
  traitJson: mpl.MetadataJson
): mpl.MetadataJson {

  // Extract trait to be added to Avatar
  const newTrait = traitJson.attributes[0]

  const newAvatarJson = JSON.parse(JSON.stringify(avatarJson))

  // Add new trait to Avatar or replace it if already existing
  const attributes = newAvatarJson.attributes.filter(a => a.trait_type != newTrait.trait_type)
  attributes.push(newTrait)
  newAvatarJson.attributes = attributes

  // Remove the path to the image to let Arweave overwrite it
  newAvatarJson.image = '0.png'
  newAvatarJson.properties.files[0].uri = '0.png'

  return newAvatarJson
}