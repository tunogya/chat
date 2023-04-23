import type { NextApiRequest, NextApiResponse } from 'next';
import pay from "@/utils/WxPay";
import {getSession, withApiAuthRequired} from "@auth0/nextjs-auth0";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({error: 'Method Not Allowed'});
    return;
  }
  const {description, out_trade_no, quantity, topic, attach} = req.body;
  let total = 0;
  if (topic === 'chatgpt' && quantity > 0) {
    switch (quantity) {
      case 30:
        total = 1800;
        break;
      case 90:
        total = 4500;
        break;
      case 180:
        total = 7800;
        break;
      case 365:
        total = 11800;
        break;
      default:
        total = quantity;
    }
  } else {
    res.status(400).json({error: 'Bad Request'});
    return;
  }
  try {
    const params = {
      appid: 'wxc7d6f9e23b346d39',
      mchid: '1642508849',
      description,
      out_trade_no: out_trade_no,
      notify_url: 'https://www.abandon.chat/api/pay/weixin/callback',
      amount: {
        total: total,
      },
      attach,
    };
    const data = await pay.transactions_native(params)
    res.status(200).json({status: 'ok', data});
  } catch (error) {
    console.log(error);
  }
});
