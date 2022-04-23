import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { Metadata, MetadataData } from '@metaplex-foundation/mpl-token-metadata';
import * as mpl from '@metaplex/js'


export async function getMetadata(
  mint: PublicKey,
  connection: anchor.web3.Connection,
): Promise<Metadata> {
  const metadataKey = await Metadata.getPDA(mint);
  return Metadata.load(connection, metadataKey);
}

export async function downloadMetadataFromArweave(
  mint: PublicKey,
  connection: anchor.web3.Connection,
): Promise<mpl.MetadataJson> {
  const metadata = await getMetadata(mint, connection);
  return mpl.utils.metadata.lookup(metadata.data.data.uri);
}

interface MetadataInfo {
  avatarJson: mpl.MetadataJson,
  readonly traitJson: mpl.MetadataJson,
}

export async function fetchArweaveMetadata(
  avatarMint: PublicKey,
  traitMint: PublicKey,
  connection: anchor.web3.Connection
): Promise<MetadataInfo> {
  return {
    avatarJson: await downloadMetadataFromArweave(avatarMint, connection),
    traitJson: await downloadMetadataFromArweave(traitMint, connection),
  }
}

export function udpateAvatarMetadata(
  avatarJson: mpl.MetadataJson,
  traitJson: mpl.MetadataJson
): mpl.MetadataJson {

  // Extract trait to be added to Avatar
  const newTrait = traitJson.attributes[0]

  // Add new trait to Avatar or replace it if already existing
  const attributes = avatarJson.attributes.filter(a => a.trait_type != newTrait.trait_type)
  attributes.push(newTrait)
  avatarJson.attributes = attributes

  // Remove the path to the image to let Arweave overwrite it
  avatarJson.image = '0.png'
  avatarJson.properties.files[0].uri = '0.png'

  return avatarJson
}