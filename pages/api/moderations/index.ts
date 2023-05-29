import {NextApiRequest, NextApiResponse} from 'next';
import * as crypto from "crypto";
import {withApiAuthRequired} from "@auth0/nextjs-auth0";
import RPCClient from "@alicloud/pop-core";
import redisClient from "@/utils/Redis";

let client = new RPCClient({
  accessKeyId: process.env.ALIYUN_ACCESS_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_SECRET || '',
  endpoint: "https://green-cip.cn-shanghai.aliyuncs.com",
  apiVersion: '2022-03-02'
});

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({error: 'Method Not Allowed'});
    return;
  }
  const {input, area} = req.body;
  if (!input) {
    res.status(400).json({error: 'Input is required'});
    return;
  }
  let flagged = false, blocked = false;
  const hash = crypto.createHash('sha256').update(input).digest('hex');

  if (area === 'china') {
    console.log('china moderation')
    try {
      const redisKey = `flag:${hash}`;
      const redisValue = await redisClient.client.get(redisKey);
      if (redisValue) {
        flagged = JSON.parse(redisValue).flagged;
        blocked = JSON.parse(redisValue).blocked;
        res.status(200).json({flagged, blocked});
        return;
      }
    } catch (e) {
      console.log(e);
    }

    try {
      const params = {
        "Service": "ai_art_detection",
        "ServiceParameters": JSON.stringify({
          "content": input,
        })
      }
      const requestOption = {
        method: 'POST',
        formatParams: false,
      }
      let response = await client.request('TextModeration', params, requestOption)
      // @ts-ignore
      if (response.Code === 500) {
        console.log("switch to beijing")
        client = new RPCClient({
          accessKeyId: process.env.ALIYUN_ACCESS_ID || '',
          accessKeySecret: process.env.ALIYUN_ACCESS_SECRET || '',
          endpoint: "https://green-cip.cn-beijing.aliyuncs.com",
          apiVersion: '2022-03-02'
        });
        response = await client.request('TextModeration', params, requestOption)
      }
      // @ts-ignore
      const labels = response?.Data?.labels || undefined;
      switch (labels) {
        case undefined:
          break;
        // ad：广告
        case 'ad':
          flagged = true;
          blocked = false;
          break;
        // political_content：涉政
        case 'political_content':
          flagged = true;
          blocked = true;
          break;
        // profanity：辱骂
        case 'profanity':
          flagged = true;
          blocked = false;
          break;
        // contraband：违禁品
        case 'contraband':
          flagged = true;
          blocked = true;
          break;
        // sexual_content：色情
        case 'sexual_content':
          flagged = true;
          blocked = true;
          break;
        // violence：暴恐
        case 'violence':
          flagged = true;
          blocked = true;
          break;
        // ad_compliance：广告法合规
        case 'ad_compliance':
          flagged = true;
          blocked = false;
          break;
        // compliance_fin：金融类合规
        case 'compliance_fin':
          flagged = true;
          blocked = false;
          break;
        // nonsense：灌水
        case 'nonsense':
          flagged = true;
          blocked = false;
          break;
        // negative_content：不良场景
        case 'negative_content':
          flagged = true;
          blocked = true;
          break;
        // cyberbullying：网络暴力
        case 'cyberbullying':
          flagged = true;
          blocked = true;
          break;
        // C_customized：用户库命中
        case 'C_customized':
          flagged = true;
          blocked = true;
          break;
        default:
          break;
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }

    try {
      const redisKey = `flag:${hash}`;
      const redisValue = JSON.stringify({
        flagged,
        blocked
      });
      await redisClient.client.set(redisKey, redisValue);
      await redisClient.client.expire(redisKey, 60 * 60 * 24 * 7); // 7 days
    } catch (e) {
      console.log(e);
    }

    res.status(200).json({
      service: 'ai_art_detection',
      flagged,
      blocked,
    });
    return;
  }

  if (!area || area === 'global') {
    console.log('global moderation')
    try {
      const request = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_SECRET ?? ''}`,
        },
        body: JSON.stringify({
          input,
          model: 'text-moderation-latest',
        })
      })
      const response = await request.json();
      const flagged = response.results?.[0]?.flagged;
      const blocked = Object.values(response.results?.[0]?.categories).reduce((acc, curr) => acc || curr);
      res.status(200).json({
        service: 'openai',
        flagged,
        blocked,
      });
    } catch (e) {
      res.status(500).json({error: 'Internal Server Error'});
    }
  }
});