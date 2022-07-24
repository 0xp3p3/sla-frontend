import { PublicKey } from '@solana/web3.js';
import { SLA_PROGRAM_ID } from '../constants';


export async function generateSlaAvatarPda(
  mint: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from("sla_llama"), mint.toBuffer()], 
    new PublicKey(SLA_PROGRAM_ID)
  )
}

export async function generateSlaMasterPda(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from("sla_master")], 
    new PublicKey(SLA_PROGRAM_ID)
  )
}

export async function getSlaTreasuryPda(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from("sla_treasury")],
    new PublicKey(SLA_PROGRAM_ID)
  )
}

export async function getSlaRankingPda(mint: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from("sla_ranking"), mint.toBuffer()],
    new PublicKey(SLA_PROGRAM_ID),
  )
}

export async function getBadgeSupplyCounter(): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from("sla_badge_pot")],
    new PublicKey(SLA_PROGRAM_ID)
  )
}
