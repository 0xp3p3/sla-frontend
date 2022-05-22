import type { NextApiRequest, NextApiResponse } from 'next';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Wallet } from "@project-serum/anchor";
import { IDL as GemBankIDL } from "@gemworks/gem-farm-ts/dist/types/gem_bank"
import { IDL as GemFarmIDL} from "@gemworks/gem-farm-ts/dist/types/gem_farm"
import { GemFarmClient, GEM_FARM_PROG_ID, GEM_BANK_PROG_ID, RarityConfig, findRarityPDA } from "@gemworks/gem-farm-ts";
import { getNFTMetadata } from '../../../utils/nfts';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // Extract the mint address to update
  const { mint } = req.query as { mint: string }
  console.log(`Setting rarity points for mint ${mint}`)

  // Initialize the farm manager wallet
  const secretKey = process.env.FARM_MANAGER_SECRET_KEY
  const farmManager = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(secretKey))
  )
  const wallet = new Wallet(farmManager)

  // Initialize the farm manager wallet
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT
  const connection = new Connection(endpoint)

  // Initialize the farm client
  const farmClient = new GemFarmClient(connection, wallet, GemFarmIDL, GEM_FARM_PROG_ID, GemBankIDL, GEM_BANK_PROG_ID)
  const farm = new PublicKey(process.env.NEXT_PUBLIC_GEMFARM_ID)
  const farmAcc = await farmClient.fetchFarmAcc(farm)

  // Fetch the current rarity points
  const currentPoints = await fetchRarityPoints(farmAcc.bank, mint, farmClient)
  console.log(`Current rarity points: ${currentPoints} for mint ${mint}`)

  // Calculate what the rarity points should be
  const newPoints = await calculateRarityPoints(connection, mint)
  console.log(`Expected rarity points: ${newPoints} for mint ${mint}`)

  // If the rarity points are already correct, nothing to do
  if (currentPoints === newPoints) {
    console.log(`No need to update rarity points`)
    res.status(200).send({ message: `Rarity points are already set to ${currentPoints} for mint ${mint}` })
    return
  }

  // Add rarity configuration to the farm 
  const config: RarityConfig[] = [
    {
      mint: new PublicKey(mint),
      rarityPoints: newPoints,
    }
  ]
  await farmClient.addRaritiesToBank(farm, farmManager.publicKey, config)
  console.log(`Finished setting rarity points for mint ${mint}`)

  res.status(200).send({ message: `Updated rarity pints to ${newPoints} for mint ${mint}` })
}


async function fetchRarityPoints(bank: PublicKey, mint: string, farmClient: GemFarmClient): Promise<number> {

  const [rarityAddr] = await findRarityPDA(bank, new PublicKey(mint))
  console.log(`rarity address: ${rarityAddr.toString()}`)

  try {
    const rarityAcc = await farmClient.fetchRarity(rarityAddr)
    return rarityAcc.points
  } catch (error: any) {
    console.log(`Failed fetching rarity account for mint ${mint}`)
    console.log(error)
    return 1
  }
}


async function calculateRarityPoints(connection: Connection, mint: string): Promise<number> {

  // Fetch metadata of mint
  const { externalMetadata } = await getNFTMetadata(mint, connection)
  const attributes = externalMetadata.attributes

  // The default rarity points for all basic agents
  let rarityPoints = 2

  // Change the base rarity points if the agent has a badge
  const badges = attributes.filter(a => a.trait_type === "Badge")
  if (badges.length > 0) {
    const badge = badges[0].value 
    switch (badge) {
      case "Bronze":
        rarityPoints = 5
        break;
      case "Silver":
        rarityPoints = 7
        break;
      case "Gold":
        rarityPoints = 9
        break;
      case "Diamond":
        rarityPoints = 11
        break;
      case "Platinum":
        rarityPoints = 15
        break;
      default:
        console.log(`Badge ${badge} is not recognised`)
    }
  }

  // Add +2 for agents with a legendary skin
  const allLegendarySkins = [
    "Abstract Colors",
    "Bat",
    "Crystal",
    "Demon",
    "Dragon",
    "Gold",
    "Lava",
  ]
  const skin = attributes.filter(a => a.trait_type === "Skin" && allLegendarySkins.includes(a.value))
  if (skin.length > 0) {
    rarityPoints += 2
  }

  // Add +5 if the NFT is an imposter
  const imposterAttribute = attributes.filter(a => a.trait_type === "Imposter")
  if (imposterAttribute.length > 0) {
    rarityPoints += 5
  }

  return rarityPoints
}