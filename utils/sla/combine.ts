import * as anchor from "@coral-xyz/anchor";
import { sendSignedTransaction } from '../transaction';


export async function updateOnChainMetadataAfterCombine(
  avatarMint: string,
  traitMint: string,
  wallet: anchor.Wallet,
  connection: anchor.web3.Connection,
  new_uri: string,
  newName: string | null,
  transactionSignedCallback?: () => void,
  badgeAssetId?: number | null,
): Promise<string> {

  console.log(`newName: ${newName}`)

  // Fetch the combine transaction signed by the Combine authority
  const response = await (await fetch("/api/combineTraits/getUpdateOnChainMetadataInstruction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      agentMint: avatarMint,
      traitMint: traitMint,
      owner: wallet.publicKey.toString(),
      newUri: new_uri,
      newName: newName,
      badgeAssetId: badgeAssetId,
    })
  })).json()

  // Reconstruct transaction + sign 
  const txData = JSON.parse(response.tx).data
  let transactionFromJson = anchor.web3.Transaction.from(txData)

  // Get the user to sign the transaction 
  console.log('signing using user wallet')
  console.log("before transactionFromJson", transactionFromJson)
  transactionFromJson = await wallet.signTransaction(transactionFromJson)
  console.log("after transactionFromJson", transactionFromJson)
  transactionSignedCallback()

  const tx = await sendSignedTransaction({ signedTransaction: transactionFromJson, connection })

  return tx
}