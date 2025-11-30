// Skills data structure for AI employees

export const skillCategories = {
  COMMUNICATION: 'Communication',
  MEETINGS: 'Meetings',
  AUTOMATION: 'Automation',
  ORGANIZATION: 'Organization',
  ANALYSIS: 'Analysis'
};

export const skills = [
  {
    id: 'meeting-assistant',
    name: 'Meeting Assistant',
    icon: '📅',
    description: 'Join meetings, take notes, and manage your calendar seamlessly',
    category: skillCategories.MEETINGS,
    isGlobal: true,
    color: '#667eea'
  },
  {
    id: 'slack-integration',
    name: 'Slack Integration',
    icon: '💬',
    description: 'Monitor channels, draft replies, and stay connected with your team',
    category: skillCategories.COMMUNICATION,
    isGlobal: false,
    color: '#4a154b'
  },
  {
    id: 'jira-integration',
    name: 'Jira Integration',
    icon: '🎫',
    description: 'Create tickets, update status, and manage project workflows',
    category: skillCategories.ORGANIZATION,
    isGlobal: false,
    color: '#0052cc'
  },
  {
    id: 'email-assistant',
    name: 'Email Assistant',
    icon: '📧',
    description: 'Draft emails, reply intelligently, and organize your inbox',
    category: skillCategories.COMMUNICATION,
    isGlobal: true,
    color: '#ea4335'
  },
  {
    id: 'note-taking',
    name: 'Smart Notes',
    icon: '✍️',
    description: 'Capture meeting notes, ideas, and insights instantly',
    category: skillCategories.ORGANIZATION,
    isGlobal: true,
    color: '#34a853'
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    icon: '⚡',
    description: 'Create and manage n8n workflows to automate your tasks',
    category: skillCategories.AUTOMATION,
    isGlobal: false,
    color: '#fa709a'
  },
  {
    id: 'document-analysis',
    name: 'Document Analysis',
    icon: '📄',
    description: 'Analyze documents, extract insights, and summarize content',
    category: skillCategories.ANALYSIS,
    isGlobal: true,
    color: '#4facfe'
  },
  {
    id: 'task-management',
    name: 'Task Management',
    icon: '✅',
    description: 'Create tasks, set reminders, and track your progress',
    category: skillCategories.ORGANIZATION,
    isGlobal: true,
    color: '#f093fb'
  },
  {
    id: 'calendar-management',
    name: 'Calendar Management',
    icon: '🗓️',
    description: 'Schedule meetings, find time slots, and manage your calendar',
    category: skillCategories.MEETINGS,
    isGlobal: true,
    color: '#43e97b'
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    icon: '🔍',
    description: 'Search company knowledge, find answers, and access documentation',
    category: skillCategories.ANALYSIS,
    isGlobal: true,
    color: '#ffecd2'
  }
];

export const getSkillById = (id) => {
  return skills.find(skill => skill.id === id);
};

export const getSkillsByCategory = (category) => {
  return skills.filter(skill => skill.category === category);
};

export const getGlobalSkills = () => {
  return skills.filter(skill => skill.isGlobal);
};

export const getConfigurableSkills = () => {
  return skills.filter(skill => !skill.isGlobal);
};

