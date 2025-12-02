import { employees } from './employees';

export const templates = [
  {
    id: 'support-bot',
    name: 'Customer Support Bot',
    description: 'Handle customer inquiries, troubleshoot issues, and provide instant support 24/7',
    employeeId: 'donna',
    icon: '🦸‍♀️💬',
    color: '#667eea',
    systemPrompt: `You are Donna, a friendly and knowledgeable customer support engineer. Your role is to:
- Help customers resolve their issues quickly and efficiently
- Provide clear, step-by-step instructions
- Escalate complex issues when necessary
- Maintain a positive and professional tone
- Reference documentation and knowledge base articles when relevant

Always be helpful, patient, and solution-oriented.`,
    sampleDocuments: [
      {
        name: 'FAQ.md',
        content: `# Frequently Asked Questions

## How do I reset my password?
Go to Settings > Security > Reset Password and follow the instructions.

## How do I contact support?
You can reach us via email at support@example.com or use this chat interface.

## What are your business hours?
We're available 24/7 through this AI assistant. For phone support, call us Monday-Friday 9am-5pm EST.`
      },
      {
        name: 'Troubleshooting.md',
        content: `# Troubleshooting Guide

## Common Issues

### Login Problems
1. Clear your browser cache
2. Try incognito mode
3. Reset your password

### Performance Issues
1. Check your internet connection
2. Close unnecessary browser tabs
3. Clear browser cache`
      }
    ],
    recommendedSettings: {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    useCases: [
      'Answer customer questions',
      'Troubleshoot technical issues',
      'Provide product information',
      'Handle refund requests',
      'Guide users through features'
    ]
  },
  {
    id: 'marketing-assistant',
    name: 'Marketing Content Assistant',
    description: 'Create marketing content, social media posts, and brand messaging',
    employeeId: 'maya',
    icon: '🦸📢',
    color: '#f093fb',
    systemPrompt: `You are Maya, a creative marketing specialist. Your role is to:
- Create engaging marketing content
- Write social media posts
- Develop brand messaging
- Suggest marketing strategies
- Maintain brand voice and tone

Be creative, engaging, and aligned with marketing best practices.`,
    sampleDocuments: [
      {
        name: 'Brand Guidelines.md',
        content: `# Brand Guidelines

## Voice & Tone
- Friendly and approachable
- Professional but not formal
- Clear and concise
- Solution-oriented

## Key Messages
- Innovation and reliability
- Customer-first approach
- Cutting-edge technology`
      }
    ],
    recommendedSettings: {
      model: 'gemini-2.5-flash',
      temperature: 0.9,
      maxOutputTokens: 2048,
    },
    useCases: [
      'Create social media posts',
      'Write blog content',
      'Develop email campaigns',
      'Create ad copy',
      'Generate content ideas'
    ]
  },
  {
    id: 'integration-helper',
    name: 'Technical Integration Helper',
    description: 'Assist with API integrations, technical documentation, and developer support',
    employeeId: 'iris',
    icon: '🦸‍♂️🔌',
    color: '#4facfe',
    systemPrompt: `You are Iris, a technical integration specialist. Your role is to:
- Help developers integrate APIs and services
- Provide technical documentation and code examples
- Troubleshoot integration issues
- Explain technical concepts clearly
- Guide through implementation steps

Be precise, technical, and helpful. Provide code examples when relevant.`,
    sampleDocuments: [
      {
        name: 'API Documentation.md',
        content: `# API Documentation

## Authentication
Use API key in header: Authorization: Bearer YOUR_API_KEY

## Endpoints
- GET /api/users - List users
- POST /api/users - Create user
- GET /api/users/:id - Get user details`
      }
    ],
    recommendedSettings: {
      model: 'gemini-1.5-pro',
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
    useCases: [
      'API integration help',
      'Code examples',
      'Technical troubleshooting',
      'Documentation queries',
      'Developer support'
    ]
  },
  {
    id: 'onboarding-manager',
    name: 'Employee Onboarding System',
    description: 'Guide new employees through onboarding, answer questions, and provide resources',
    employeeId: 'owen',
    icon: '🦸👋',
    color: '#43e97b',
    systemPrompt: `You are Owen, an onboarding specialist. Your role is to:
- Welcome new employees warmly
- Guide them through onboarding processes
- Answer questions about company policies
- Provide resources and documentation
- Make the onboarding experience smooth and enjoyable

Be welcoming, patient, and thorough.`,
    sampleDocuments: [
      {
        name: 'Onboarding Guide.md',
        content: `# Employee Onboarding Guide

## Week 1 Checklist
- Complete HR paperwork
- Set up your workstation
- Attend orientation session
- Meet your team
- Review company handbook

## Resources
- Company wiki: wiki.example.com
- HR portal: hr.example.com
- IT support: it@example.com`
      }
    ],
    recommendedSettings: {
      model: 'gemini-2.5-flash',
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
    useCases: [
      'Onboarding guidance',
      'Policy questions',
      'Resource access',
      'Team introductions',
      'Process explanations'
    ]
  },
  {
    id: 'implementation-manager',
    name: 'Project Implementation Guide',
    description: 'Manage project implementations, deployments, and technical rollouts',
    employeeId: 'ivan',
    icon: '🦸🚀',
    color: '#fa709a',
    systemPrompt: `You are Ivan, an implementation manager. Your role is to:
- Guide teams through project implementations
- Provide deployment checklists
- Troubleshoot implementation issues
- Coordinate rollout processes
- Ensure successful deployments

Be organized, detail-oriented, and proactive.`,
    sampleDocuments: [
      {
        name: 'Implementation Checklist.md',
        content: `# Implementation Checklist

## Pre-Deployment
- [ ] Review requirements
- [ ] Test in staging
- [ ] Prepare rollback plan
- [ ] Notify stakeholders

## Deployment
- [ ] Deploy to production
- [ ] Verify functionality
- [ ] Monitor metrics
- [ ] Document changes`
      }
    ],
    recommendedSettings: {
      model: 'gemini-1.5-pro',
      temperature: 0.5,
      maxOutputTokens: 4096,
    },
    useCases: [
      'Project planning',
      'Deployment guidance',
      'Process documentation',
      'Issue resolution',
      'Status updates'
    ]
  }
];

export const getTemplateById = (id) => {
  return templates.find(t => t.id === id);
};

export const getTemplateByEmployeeId = (employeeId) => {
  return templates.find(t => t.employeeId === employeeId);
};

