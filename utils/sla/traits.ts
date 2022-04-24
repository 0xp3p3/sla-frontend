import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { MetadataJsonAttribute } from '@metaplex/js'

import { downloadMetadataFromArweave } from '../metadata';


interface AvatarTraits {
  background: boolean,
  skin: boolean,
  clothing: boolean,
  eyes: boolean,
  hat: boolean,
  mouth: boolean,
};

export async function getAvatarTraits(
  mint: PublicKey,
  connection: anchor.web3.Connection,
): Promise<AvatarTraits> {

  // Fetch metadata from Arweave
  const metadata = await downloadMetadataFromArweave(mint, connection);

  // Extract all attributes and cast them to lowercase
  const traitTypes = metadata.attributes?.map((entry: any) => {
    return { 
      trait_type: entry.trait_type.toLowerCase(),
      value: entry.value.toLowerCase(),
    }
  });

  const checkIfTraitAlreadyMerged = (traits: MetadataJsonAttribute[] | undefined, target: string): boolean => {
    const matchingTrait = traits?.filter(t => (t.trait_type === target) && (t.value != "original") );
    return matchingTrait ? matchingTrait.length > 0 : false
  }

  // For each trait, check if it's in the metadata
  return {
    background: checkIfTraitAlreadyMerged(traitTypes, "background"),
    skin: checkIfTraitAlreadyMerged(traitTypes, "skin"),
    clothing: checkIfTraitAlreadyMerged(traitTypes, "clothing"),
    eyes: checkIfTraitAlreadyMerged(traitTypes, "eyes"),
    hat: checkIfTraitAlreadyMerged(traitTypes, "hat"),
    mouth: checkIfTraitAlreadyMerged(traitTypes, "mouth"),
  };
}

export async function getTraitType(
  mint: PublicKey,
  connection: anchor.web3.Connection
): Promise<number> {
    // Fetch metadata from Arweave
    const metadata = await downloadMetadataFromArweave(mint, connection);

    // Extract all "trait_type" values
    const trait = metadata.attributes ? metadata.attributes[0].trait_type.toLocaleLowerCase() : "none";
    
    // Return the number that identifies the type of trait
    switch (trait) {
      case "skin": return 2;
      case "clothing": return 3;
      case "eyes": return 4;
      case "hat": return 5;
      case "mouth": return 6;
      default: return -1;
    }
}