/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    OPENAI_API_SECRET: process.env.OPENAI_API_SECRET,
    WEIXIN_APIV3_KEY: process.env.WEIXIN_APIV3_KEY,
    AUTH0_ADMIN_CLIENT_ID: process.env.AUTH0_ADMIN_CLIENT_ID,
    AUTH0_ADMIN_CLIENT_SECRET: process.env.AUTH0_ADMIN_CLIENT_SECRET,
    ALIYUN_ACCESS_ID: process.env.ALIYUN_ACCESS_ID,
    ALIYUN_ACCESS_SECRET: process.env.ALIYUN_ACCESS_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    NOTION_TOKEN: process.env.NOTION_TOKEN,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '**'
      }
    ]
  }
}

module.exports = nextConfig
