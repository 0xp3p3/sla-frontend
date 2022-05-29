import { NextApiRequest, NextApiResponse } from "next";
import * as anchor from "@project-serum/anchor";


type JsonTransaction = { type: "Buffer", data: number[] }


export default async (req: NextApiRequest, res: NextApiResponse) => {
  
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
  }

  const body = req.body

  try {
    // Re-construct transaction
    const jsonTransaction: JsonTransaction = JSON.parse(body.transaction)
    const transaction = anchor.web3.Transaction.from(jsonTransaction.data)
    
    // Sign transaction with the Combine Authority account
    const keypair = anchor.web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(process.env.COMBINE_AUTHORITY_SECRET))
    )
    console.log('signing transaction')
    transaction.partialSign(keypair)

    // Serialize transaction
    console.log('re-serializing transaction')
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toJSON()
    
    console.log('sending response')
    res.status(200).send({ tx: JSON.stringify(serializedTransaction) })

  } catch (error: any) {
    console.log(error)
    res.status(500).send( { error: 'Combine Authority could not sign transaction' })
  } 
}
