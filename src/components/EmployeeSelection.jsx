import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { employees } from '../data/employees';
import { logout } from '../utils/auth';
import { getEmployeeConfig } from '../services/employeeConfigService';
import SearchBar from './employee-selection/SearchBar';
import CategoryFilter from './employee-selection/CategoryFilter';
import FilterPanel from './employee-selection/FilterPanel';
import EmployeeCard from './employee-selection/EmployeeCard';
import CreateCustomCard from './employee-selection/CreateCustomCard';
import PreviewModal from './employee-selection/PreviewModal';
import CreateEmployeeModal from './CreateEmployeeModal';
import './EmployeeSelection.css';

// Specific employees to showcase
const showcaseEmployees = [
  {
    id: 'donna',
    name: 'Donna',
    role: 'AI Support Engineer',
    description: 'Fast, accurate frontline support specialist who resolves customer issues instantly.',
    icon: '🦸‍♀️💬',
    color: '#667eea',
    isRecommended: true,
  },
  {
    id: 'marketer',
    name: 'Maya',
    role: 'AI Marketing Strategist',
    description: 'Creates campaigns, content, and brand messaging that drives engagement.',
    icon: '🦸📢',
    color: '#f093fb',
  },
  {
    id: 'integration',
    name: 'Iris',
    role: 'AI Integration Engineer',
    description: 'Connects APIs, tools, and workflows—keeping your systems perfectly in sync.',
    icon: '🦸‍♂️🔌',
    color: '#4facfe',
  },
  {
    id: 'onboarding',
    name: 'Owen',
    role: 'AI Onboarding Manager',
    description: 'Welcomes new customers, guides setup, and ensures smooth onboarding.',
    icon: '🦸👋',
    color: '#43e97b',
  },
  {
    id: 'implementation',
    name: 'Ivan',
    role: 'AI Implementation Manager',
    description: 'Plans and delivers project implementations with clarity, speed, and precision.',
    icon: '🦸🚀',
    color: '#fa709a',
  },
];

function EmployeeSelection() {
  const navigate = useNavigate();
  const [customEmployees, setCustomEmployees] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewEmployee, setPreviewEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [filters, setFilters] = useState({
    departments: [],
    personalities: [],
    models: [],
    skills: [],
  });
  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setFilterPanelCollapsed(true);
      } else {
        setFilterPanelCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load custom employees from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customEmployees');
    if (saved) {
      try {
        const customEmps = JSON.parse(saved);
        const enhancedCustomEmps = customEmps.map(emp => ({
          ...emp,
          category: 'custom',
          department: emp.department || 'Custom',
          personality: emp.personality || 'Friendly',
          skills: emp.skills || ['Custom', 'Flexible'],
          capabilities: emp.capabilities || ['Customizable role and capabilities']
        }));
        setCustomEmployees(enhancedCustomEmps);
      } catch (e) {
        console.error('Failed to load custom employees:', e);
      }
    }
  }, []);

  // Save custom employees to localStorage whenever they change
  useEffect(() => {
    if (customEmployees.length > 0) {
      localStorage.setItem('customEmployees', JSON.stringify(customEmployees));
    }
  }, [customEmployees]);

  const allEmployees = [...showcaseEmployees, ...customEmployees];

  // Filter employees based on search, category, and filters
  const getFilteredEmployees = () => {
    let filtered = allEmployees;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query) ||
        emp.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(emp => emp.category === activeCategory);
    }

    // Advanced filters
    if (filters.departments.length > 0) {
      filtered = filtered.filter(emp => filters.departments.includes(emp.department));
    }

    if (filters.personalities.length > 0) {
      filtered = filtered.filter(emp => filters.personalities.includes(emp.personality));
    }

    if (filters.skills.length > 0) {
      filtered = filtered.filter(emp =>
        filters.skills.some(filterSkill =>
          emp.skills?.some(empSkill => 
            empSkill.toLowerCase() === filterSkill.toLowerCase() ||
            empSkill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    return filtered;
  };

  const filteredEmployees = getFilteredEmployees();
  const recommendedEmployee = filteredEmployees.find(emp => emp.isRecommended);
  const regularEmployees = filteredEmployees.filter(emp => !emp.isRecommended);

  const handleEmployeeClick = (employeeId) => {
    localStorage.setItem('lastSelectedEmployee', employeeId);
    navigate(`/employees/${employeeId}`);
  };

  const handlePreview = (employee) => {
    setPreviewEmployee(employee);
    setShowPreviewModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="employee-selection-page">
      {/* Top Navigation Bar */}
      <header className="selection-header">
        <div className="selection-nav">
          <div className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">Home</Link>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-current">AI Employees</span>
          </div>
          <div className="selection-nav-actions">
            <button 
              onClick={() => navigate('/organization/settings')} 
              className="nav-action-btn"
            >
              ⚙️ Organization Settings
            </button>
            <button onClick={handleLogout} className="nav-action-btn logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="selection-main">
        <div className="selection-container">
          {/* Header Section */}
          <div className="page-header">
            <div className="header-content">
              <h1 className="page-title">Choose Your AI Employee</h1>
              <p className="page-subtitle">
                Pick from ready-made AI employees or build one tailored to your workflow.
              </p>
            </div>
          </div>

          {/* Search and Filters Section */}
          <div className="search-filters-section">
            <div className="search-wrapper">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search employees by name or role…"
              />
            </div>
            <div className="filters-wrapper">
              <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
            <div className="section-divider"></div>
          </div>

          {/* Employee Grid */}
          <div className="employees-grid-section">
            {filteredEmployees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3 className="empty-title">No employees found</h3>
                <p className="empty-description">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="employees-grid">
                {/* Recommended Employee Card */}
                {recommendedEmployee && (
                  <EmployeeCard
                    key={recommendedEmployee.id}
                    employee={recommendedEmployee}
                    onSelect={handleEmployeeClick}
                    onPreview={handlePreview}
                    isFeatured={true}
                  />
                )}

                {/* Regular Employee Cards */}
                {regularEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onSelect={handleEmployeeClick}
                    onPreview={handlePreview}
                  />
                ))}
                
                {/* Create Custom Card */}
                <CreateCustomCard onClick={() => setShowCreateModal(true)} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreviewModal && previewEmployee && (
        <PreviewModal
          employee={previewEmployee}
          onSelect={(id) => {
            handleEmployeeClick(id);
            setShowPreviewModal(false);
          }}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Create Employee Modal */}
      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={(newEmployee) => {
          const customEmployee = {
            ...newEmployee,
            isCustom: true,
            category: 'custom',
            department: 'Custom',
            personality: 'Friendly',
            skills: ['Custom', 'Flexible'],
            capabilities: ['Customizable role and capabilities']
          };
          setCustomEmployees(prev => [...prev, customEmployee]);
          setShowCreateModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
}

export default EmployeeSelection;
