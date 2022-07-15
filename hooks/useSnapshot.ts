import { programs } from "@metaplex/js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { getOnchainMetadataForMints } from "../utils/nfts"

import mintList from "../public/json/mints.json"


const useSnapshot = () => {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [onchainSnapshot, setOnchainSnapshot] = useState<Array<programs.metadata.MetadataData>>([])
  const [namesSnapshot, setNamesSnapshot] = useState<string[]>([])

  const takeSnapshot = async () => {
    if (!publicKey) {
      setOnchainSnapshot([])
      return 
    }

    console.log('[snapshot hook] fetching on-chain data')
    const onchainSnapshot = await getOnchainMetadataForMints(mintList, connection)
    setOnchainSnapshot(onchainSnapshot)

    const onchainNames = onchainSnapshot.map(s => s.data.name)
    setNamesSnapshot(onchainNames)
  }

  useEffect(() => {
    takeSnapshot()
  }, [publicKey])

  return { onchainSnapshot, namesSnapshot }
}

export default useSnapshot