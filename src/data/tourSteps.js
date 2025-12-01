// Tour step configurations for different pages

export const employeeSelectionTour = [
  {
    target: '[data-tour-target="employees-grid"]',
    title: 'Welcome! Select an AI Employee',
    description: 'Click on any employee card below to open their workspace. Each employee has unique capabilities: Pam (Support), Oscar (Integration), Erin (Onboarding), Dwight (Implementation), and Maya (Marketing).',
    position: 'top'
  },
  {
    target: '[data-tour-target="create-card"]',
    title: 'Create Your Own Employee',
    description: 'Need something custom? Click the "+ Create Custom" card to build your own AI employee tailored to your specific needs. You can customize their role, personality, and expertise.',
    position: 'top'
  },
  {
    target: '.org-settings-button',
    title: 'Organization Settings',
    description: 'Access organization-wide settings to manage knowledge stores, files, and preferences that apply to all employees in your workspace.',
    position: 'bottom'
  }
];

export const employeeDetailTour = [
  {
    target: '[data-tour-target="tabs-container"]',
    title: 'Navigate Between Sections',
    description: 'Use these tabs to navigate between three main sections: Chat, Educate/Train, and Skillset. Click any tab to switch views.',
    position: 'right'
  },
  {
    target: '.tab-button[data-tab="chat"]',
    title: 'Chat with Your Employee',
    description: 'Click the Chat tab to interact with your AI employee. Ask questions, give instructions, and collaborate in real-time. Type your message and press Enter to send.',
    position: 'right'
  },
  {
    target: '.tab-button[data-tab="educate"]',
    title: 'Train Your Employee',
    description: 'Click the Educate/Train tab to teach your employee by uploading knowledge or creating smart notes. This helps the AI understand your specific needs and context.',
    position: 'right'
  },
  {
    target: '.subtab-button[data-subtab="notes"]',
    title: 'Smart Note Maker',
    description: 'After opening the Educate tab, use Smart Note Maker to create structured notes. This teaches your employee specific information that the AI can reference later. Click "Create Note" to get started.',
    position: 'bottom'
  },
  {
    target: '.subtab-button[data-subtab="upload"]',
    title: 'Upload Documents',
    description: 'After opening the Educate tab, use Upload Documents to add PDFs, documents, or files. The AI will analyze and extract knowledge from these files. Drag and drop or click to browse files.',
    position: 'bottom'
  },
  {
    target: '.tab-button[data-tab="skillset"]',
    title: 'Enable Skills',
    description: 'Click the Skillset tab to enable and configure skills. Skills give your employee specific capabilities like meeting assistance, email management, or task tracking.',
    position: 'right'
  },
  {
    target: '[data-tour-target="skills-grid"]',
    title: 'Browse and Configure Skills',
    description: 'After opening the Skillset tab, browse available skills organized by category. Toggle them on/off using the switch, and click any skill card to configure its settings and behavior.',
    position: 'top'
  },
  {
    target: '[data-tour-target="skills-filter-bar"]',
    title: 'Filter Skills',
    description: 'After opening the Skillset tab, use these filter buttons to view all skills, only enabled ones, or only disabled ones. This helps you manage your employee\'s capabilities.',
    position: 'bottom'
  },
  {
    target: '.settings-button',
    title: 'Employee Settings',
    description: 'Access employee settings to customize behavior, preferences, and advanced configurations. Configure how this employee responds and operates.',
    position: 'bottom'
  },
  {
    target: '.back-button',
    title: 'Back to Employees',
    description: 'Return to the employees list to switch between different AI employees or create new ones.',
    position: 'bottom'
  }
];

