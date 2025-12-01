// Demo data for demo mode

export const demoConversations = {
  donna: [
    {
      id: 1,
      text: "Hello! I'm Pam, your AI support engineer. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(Date.now() - 3600000),
      sources: []
    },
    {
      id: 2,
      text: "I'm having trouble logging into my account",
      sender: 'user',
      timestamp: new Date(Date.now() - 3550000),
      sources: []
    },
    {
      id: 3,
      text: "I'd be happy to help you with that! Let's try a few troubleshooting steps:\n\n1. **Clear your browser cache** - Sometimes cached data can cause login issues\n2. **Try incognito/private mode** - This helps rule out browser extension conflicts\n3. **Reset your password** - Go to Settings > Security > Reset Password\n\nIf none of these work, I can escalate this to our technical team. Which step would you like to try first?",
      sender: 'ai',
      timestamp: new Date(Date.now() - 3500000),
      sources: [
        {
          title: 'Troubleshooting Guide',
          text: 'Login Problems: Clear browser cache, try incognito mode, reset password',
          fileSearchStore: 'demo-store'
        }
      ]
    },
    {
      id: 4,
      text: "I'll try clearing my cache first",
      sender: 'user',
      timestamp: new Date(Date.now() - 3450000),
      sources: []
    },
    {
      id: 5,
      text: "Great choice! After clearing your cache, try logging in again. If you're still having issues, let me know and we can try the next step. I'm here to help!",
      sender: 'ai',
      timestamp: new Date(Date.now() - 3400000),
      sources: []
    }
  ],
  marketer: [
    {
      id: 1,
      text: "Hi! I'm Maya, your marketing assistant. Ready to create some amazing content?",
      sender: 'ai',
      timestamp: new Date(Date.now() - 7200000),
      sources: []
    },
    {
      id: 2,
      text: "I need a social media post for our new product launch",
      sender: 'user',
      timestamp: new Date(Date.now() - 7150000),
      sources: []
    },
    {
      id: 3,
      text: "Exciting! Here's a social media post for your product launch:\n\n🚀 **Introducing [Product Name] - Innovation Meets Reliability!**\n\nWe're thrilled to announce our latest product that combines cutting-edge technology with a customer-first approach.\n\n✨ Key Features:\n• Feature 1\n• Feature 2\n• Feature 3\n\nReady to experience the future? Learn more: [link]\n\n#Innovation #NewProduct #Technology\n\nWould you like me to adjust the tone or add any specific details?",
      sender: 'ai',
      timestamp: new Date(Date.now() - 7100000),
      sources: [
        {
          title: 'Brand Guidelines',
          text: 'Voice: Friendly and approachable, Professional but not formal',
          fileSearchStore: 'demo-store'
        }
      ]
    }
  ]
};

export const demoDocuments = [
  {
    name: 'files/demo-faq.md',
    displayName: 'FAQ.md',
    createTime: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    name: 'files/demo-troubleshooting.md',
    displayName: 'Troubleshooting Guide.md',
    createTime: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    name: 'files/demo-brand.md',
    displayName: 'Brand Guidelines.md',
    createTime: new Date(Date.now() - 86400000).toISOString(),
  }
];

export const demoStores = [
  {
    name: 'demo-store',
    displayName: 'Demo Knowledge Source',
    activeDocumentsCount: 3,
    pendingDocumentsCount: 0,
    failedDocumentsCount: 0,
    sizeBytes: '50000',
  }
];

