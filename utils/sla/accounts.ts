import { PublicKey } from '@solana/web3.js';
import solana_config from '../../../sla-config/solana/config.json';


export async function generateSlaNftPda(
  mint: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from(solana_config.program.seeds.master), mint.toBuffer()], 
    new PublicKey(solana_config.program.id)
  )
}

export async function generateSlaMasterPda(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from(solana_config.program.seeds.master)], 
    new PublicKey(solana_config.program.id)
  )
}
