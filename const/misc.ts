export const CHATGPT_MEMBERSHIP = {
  STANDARD: {
    // record membership in Auth0
    id: 'chatgpt_standard',
    name: 'ChatGPT Standard',
    // price id in  Stripe
    price: 'price_1Ncr6kFPpv8QfieYkTe1gfa6',
    description: '$5/mo',
  },
  PLUS: {
    id: 'chatgpt_plus',
    name: 'ChatGPT Plus',
    price: 'price_1NdC7JFPpv8QfieYMvBGGcSt',
    description: '$20/mo',
  },
}

export const OPENAI_MODELS = {
  GPT3_5: {
    topic: 'GPT-3.5',
    model: 'gpt-3.5-turbo',
  },
  GPT4: {
    topic: 'GPT-4',
    model: 'gpt-4',
  }
}