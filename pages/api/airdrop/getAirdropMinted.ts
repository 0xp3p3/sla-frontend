import { NextApiRequest, NextApiResponse } from "next";
import prisma from '../../../lib/prisma';

/*  
 * Returns `true` if the wallet specified as slug is whitelisted
*/
export default async (req: NextApiRequest, res: NextApiResponse) => {  
  const entry = await prisma.whitelist.findFirst({
    where: {
      id: 0,
    },
  })
  
  if (entry) {
    res.send({ total: entry.total })
    return
  } else {
    res.send({ error: 'Could not fetch number of whitelist mints left' })
  }
}