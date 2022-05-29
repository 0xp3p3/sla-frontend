import * as anchor from '@project-serum/anchor';
import { NFT } from '../../hooks/useWalletNFTs';
import { generateSlaAvatarPda } from './accounts';
import { SLA_COLLECTIONS, SLA_PROGRAM_ID } from '../constants';
import * as idl from "../../sla_idl.json";


export async function checkIfTraitCanBeCombined(
  avatar: NFT, 
  trait: NFT,
  connection: anchor.web3.Connection,
  wallet: anchor.Wallet,
): Promise<boolean> {

  // Initialize a connection to SLA program
  const provider = new anchor.Provider(connection, wallet, {preflightCommitment: 'processed'})
  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const [avatarPda] = await generateSlaAvatarPda(avatar.mint)

  const traitCollection = trait.onchainMetadata.collection.key
  const traitName = Object.keys(SLA_COLLECTIONS).filter(key => SLA_COLLECTIONS[key].collection === traitCollection)[0].toLowerCase()

  let allowed = true
  try {
    const avatarAccount = await program.account.avatarAccount.fetch(avatarPda)
    const traits = avatarAccount.traits

    if (
      (traits.skin && traitName === 'skin') ||
      (traits.clothing && traitName === "clothing") ||
      (traits.eyes && traitName === "eyes") ||
      (traits.hat && traitName === "hat") ||
      (traits.mouth && traitName === "mouth")
    ) {
      allowed = false
    } 
  } catch (error: any) {
    console.log('Could not fetch the llama PDA account')
  }

  console.log(`[checking combination]: ${allowed ? 'allowed' : 'not allowed'}`)

  return allowed
}
