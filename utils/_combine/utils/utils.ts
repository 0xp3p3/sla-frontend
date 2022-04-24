import { Keypair } from '@solana/web3.js'
import fs from 'fs'
import path from 'path'


export function loadArweaveWalletKeypair() {
  const config = path.join(__dirname, '../../.config/arweave-wallet.json')

  return Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(config).toString())),
  )
}

export function deleteFolder(dirPath: string) {
  fs.rm(dirPath, { recursive: true, force: true }, (err: any) => {
    if (err) {
      console.log(`Could not remove directory ${dirPath}`)
      console.log(err)
    }
  })
}