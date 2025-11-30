// Employee data structure
export const employees = [
  {
    id: 'donna',
    name: 'Donna',
    role: 'AI Support Engineer',
    description: 'Your support employee who helps with customer inquiries and technical issues',
    icon: '💬'
  },
  {
    id: 'marketer',
    name: 'AI Marketer',
    role: 'AI Marketer',
    description: 'Handles marketing campaigns, content creation, and brand management',
    icon: '📢'
  },
  {
    id: 'integration',
    name: 'AI Integration Support Engineer',
    role: 'AI Integration Support Engineer',
    description: 'Manages integrations, API connections, and technical integrations',
    icon: '🔌'
  },
  {
    id: 'onboarding',
    name: 'AI Onboarding Manager',
    role: 'AI Onboarding Manager',
    description: 'Manages customer onboarding processes and welcome experiences',
    icon: '👋'
  },
  {
    id: 'implementation',
    name: 'AI Implementation Manager',
    role: 'AI Implementation Manager',
    description: 'Oversees project implementations and deployment processes',
    icon: '🚀'
  },
  {
    id: 'custom',
    name: 'Create Your Own Custom Employee',
    role: 'Custom Employee',
    description: 'Build and configure your own custom AI employee tailored to your needs',
    icon: '⚙️'
  }
];

export const getEmployeeById = (id) => {
  return employees.find(emp => emp.id === id) || employees[0]; // Default to Donna
};

export const getDefaultEmployee = () => {
  return employees[0]; // Donna
};

