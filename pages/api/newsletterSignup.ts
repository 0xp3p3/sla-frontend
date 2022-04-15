// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const options = {
    method: "POST",
    url: 'https://a.klaviyo.com/api/v2/list/TurRV2/subscribe',
    params: {api_key: process.env.KLAVIYO_PRIVATE_KEY},
    headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
    data: {
      profiles: [
        {email: req.body.email},
      ]
    }
  }

  axios.request(options)
    .then((response) => { res.status(200).json({ message: 'Form submitted'})})
    .catch((response) => { res.status(500).json({ message: `Unable to submit the form.`})})
}