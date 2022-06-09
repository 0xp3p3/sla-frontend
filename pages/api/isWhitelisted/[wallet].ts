import { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prisma';

/*  
 * Returns `true` if the wallet specified as slug is whitelisted
*/
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { wallet } = req.query as { wallet: string }
  
  const user = await prisma.whitelist.findFirst({
    where: {
      wallet: wallet,
    },
  })
  
  if (!user) {
    res.send({ whitelisted: false, id: null })
    return
  }

  const leftToMint = user.reserved - user.minted
  res.send({ whitelisted: leftToMint > 0, id: user.id, leftToMint: leftToMint })
}