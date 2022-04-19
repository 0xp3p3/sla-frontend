import { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prisma';

/*  
 * Returns `true` if the wallet specified as slug is whitelisted
*/
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { whitelistId } = req.query as { whitelistId: string }

  try {
    await prisma.whitelist.update({
      where: {
        id: parseInt(whitelistId),
      },
      data: {
        minted: true,
      }
    })
    res.send(true)
  } catch (error: any) {
    res.send(false)
  }
}