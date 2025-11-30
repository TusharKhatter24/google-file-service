// Employee data structure
export const employees = [
  {
    id: 'donna',
    name: 'Donna',
    role: 'AI Support Engineer',
    description: 'Your support superhero who helps with customer inquiries and technical issues. She\'s always ready to save the day!',
    icon: '🦸‍♀️💬',
    color: '#667eea'
  },
  {
    id: 'marketer',
    name: 'Maya',
    role: 'AI Marketer',
    description: 'Your marketing superhero who handles campaigns, content creation, and brand management. She turns ideas into engagement!',
    icon: '🦸📢',
    color: '#f093fb'
  },
  {
    id: 'integration',
    name: 'Iris',
    role: 'AI Integration Support Engineer',
    description: 'Your integration superhero who manages API connections and technical integrations. She connects everything seamlessly!',
    icon: '🦸‍♂️🔌',
    color: '#4facfe'
  },
  {
    id: 'onboarding',
    name: 'Owen',
    role: 'AI Onboarding Manager',
    description: 'Your onboarding superhero who manages customer onboarding and welcome experiences. He makes first impressions unforgettable!',
    icon: '🦸👋',
    color: '#43e97b'
  },
  {
    id: 'implementation',
    name: 'Ivan',
    role: 'AI Implementation Manager',
    description: 'Your implementation superhero who oversees project implementations and deployments. He gets things done, fast!',
    icon: '🦸🚀',
    color: '#fa709a'
  }
];

export const getEmployeeById = (id) => {
  // First check default employees
  const defaultEmployee = employees.find(emp => emp.id === id);
  if (defaultEmployee) {
    return defaultEmployee;
  }
  
  // Check custom employees in localStorage
  const customEmployeesJson = localStorage.getItem('customEmployees');
  if (customEmployeesJson) {
    try {
      const customEmployees = JSON.parse(customEmployeesJson);
      const customEmployee = customEmployees.find(emp => emp.id === id);
      if (customEmployee) {
        return customEmployee;
      }
    } catch (e) {
      console.error('Failed to parse custom employees:', e);
    }
  }
  
  // Default to Donna
  return employees[0];
};

export const getDefaultEmployee = () => {
  return employees[0]; // Donna
};

