import * as anchor from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor"

import { SLA_PROGRAM_ID } from "../constants";
import idl from '../../sla_idl.json'
import { getBadgeSupplyCounter } from "./accounts";
import { sendTransaction } from "../transaction";



export interface BadgeSupply {
  bronze: number,
  silver: number,
  gold: number,
  platinum: number,
  diamond: number,
}


export async function fetchBadgeSupply(
  wallet: Wallet,
  connection: anchor.web3.Connection,
): Promise<BadgeSupply | null> {

    // Initialize a connection to SLA program
    const provider = new anchor.AnchorProvider(connection, wallet, {
      preflightCommitment: 'processed',
      commitment: "processed",
    })
  
    // @ts-ignore
    const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

    const [badgeSupplyCounter] = await getBadgeSupplyCounter()

    try {
      const counter = await program.account.badgeSupplyCounter.fetch(badgeSupplyCounter)
      return {
        bronze: counter.bronze,
        silver: counter.silver,
        gold: counter.gold,
        platinum: counter.platinum,
        diamond: counter.diamond,
      }
    } catch (error: any) {
      console.log(error)
      return null
    }
}


export async function setInitialBadgeSupply(
  wallet: Wallet,
  connection: anchor.web3.Connection,
): Promise<string> {

  // Initialize a connection to SLA program
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: 'processed',
  })

  // @ts-ignore
  const program = new anchor.Program(idl, SLA_PROGRAM_ID, provider)

  const [badgeSupplyCounter, badgeSupplyCounterBump] = await getBadgeSupplyCounter()
  
  console.log(`authority: ${wallet.publicKey}`)

  console.log(`creating transaction`)
  const instruction = program.instruction.initBadgeSupplyCounter(
    new anchor.BN(badgeSupplyCounterBump),
    new anchor.BN(170),
    new anchor.BN(20),
    new anchor.BN(3),
    new anchor.BN(3),
    new anchor.BN(1),
    {
      accounts: {
        badgeSupplyCounter,
        authority: wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    }
  )
  const transaction = new anchor.web3.Transaction().add(instruction)

  return await sendTransaction({
    transaction,
    wallet: provider.wallet,
    signers: [],
    connection,
  })
}