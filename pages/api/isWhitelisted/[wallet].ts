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
      minted: false,
    },
  })
  
  res.send({whitelisted: user !== null, id: user ? user.id : null})
}