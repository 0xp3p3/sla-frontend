import { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prisma';

/*  
 * Returns `true` if the wallet specified as slug is whitelisted
*/
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { wallet } = req.query as { wallet: string }

  try {
    await prisma.whitelist.update({
      where: { wallet: wallet },
      data: { minted: { increment: 1 } }
    })
    res.send({message: "Updated the whitelist"})
  } catch (error: any) {
    res.send({error: error})
  }
}
