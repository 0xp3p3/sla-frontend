import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { IDL as GemBankIDL } from "@gemworks/gem-farm-ts/dist/types/gem_bank"
import { IDL as GemFarmIDL } from "@gemworks/gem-farm-ts/dist/types/gem_farm"
import { GemFarmClient, GEM_FARM_PROG_ID, GEM_BANK_PROG_ID } from "@gemworks/gem-farm-ts";
import { GetServerSideProps } from "next";

import PageWrapper from "../components/layout/PageWrapper";
import StakingMain from "../components/staking/StakingMain";


const Staking = ({ gemsStaked }: { gemsStaked: number }) => {
  return (
    // <PageWrapper 
    //   title="SLA Staking" 
    //   ogImageSource="/images/Logo-7-p-500.png" 
    //   webflowPageId="622e05c936936e3f74fc8f3b" 
    //   webflowSandwichMenuId="aa61bda1-efb4-8bea-910f-0dc8c3e04b1f"
    //   toTopArrow={false}
    // >
    //   <StakingMain gemsStaked={gemsStaked} />
    // </PageWrapper>
    <></>
  )
}


export const getServerSideProps: GetServerSideProps = async (context) => {

  try {

    // Initialize the farm manager wallet
    const secretKey = process.env.FARM_MANAGER_SECRET_KEY
    const farmManager = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(secretKey))
    )
    const wallet = new Wallet(farmManager)

    const endpoint = process.env.NEXT_PUBLIC_SOLANA_ENDPOINT
    const connection = new Connection(endpoint)

    console.log('Generating the farm client')
    const farmClient = new GemFarmClient(connection, wallet, GemFarmIDL, GEM_FARM_PROG_ID, GemBankIDL, GEM_BANK_PROG_ID)

    console.log('Fetching the farm account')
    const farm = new PublicKey(process.env.NEXT_PUBLIC_GEMFARM_ID)
    const farmAcc = await farmClient.fetchFarmAcc(farm)

    console.log('Finished fetching farm account')

    return {
      props: {
        gemsStaked: farmAcc.gemsStaked.toNumber()
      }
    }
  } catch (error: any) {
    console.log('Error fetching staked gems', error)
  }
}


export default Staking