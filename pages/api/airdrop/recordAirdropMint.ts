import { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prisma';

/*  
 * Returns `true` if the wallet specified as slug is whitelisted
*/
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await prisma.whitelist.update({
      where: { id: 0 },
      data: { total: { increment: 1 } }
    })
    res.send({message: "Airdrop completed"})
  } catch (error: any) {
    res.send({error: error})
  }
}
