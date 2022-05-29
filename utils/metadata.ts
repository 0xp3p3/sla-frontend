import * as mpl from '@metaplex/js'


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