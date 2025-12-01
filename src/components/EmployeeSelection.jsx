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
import RecommendedSection from './employee-selection/RecommendedSection';
import CreateEmployeeModal from './CreateEmployeeModal';
import './EmployeeSelection.css';

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
        // Add default properties to custom employees
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

  const defaultEmployees = employees.filter(emp => emp.id !== 'custom');
  const allEmployees = [...defaultEmployees, ...customEmployees];

  // Get recommended employees (last selected or most used)
  const getRecommendedEmployees = () => {
    const lastSelectedId = localStorage.getItem('lastSelectedEmployee');
    if (lastSelectedId) {
      const recommended = allEmployees.find(emp => emp.id === lastSelectedId);
      return recommended ? [recommended] : [];
    }
    // Default to first employee if no history
    return defaultEmployees.slice(0, 1);
  };

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

    // Model type filter (check employee config)
    if (filters.models.length > 0) {
      filtered = filtered.filter(emp => {
        try {
          const config = getEmployeeConfig(emp.id);
          const modelDisplayNames = {
            'gemini-2.5-flash': 'Gemini 2.5 Flash',
            'gemini-2.0-flash-exp': 'Gemini 2.0 Flash Exp',
            'gemini-1.5-pro': 'Gemini 1.5 Pro',
          };
          const empModelDisplay = modelDisplayNames[config?.chat?.model] || config?.chat?.model || 'Gemini 2.5 Flash';
          return filters.models.includes(empModelDisplay);
        } catch (e) {
          return false;
        }
      });
    }

    return filtered;
  };

  const filteredEmployees = getFilteredEmployees();
  const recommendedEmployees = getRecommendedEmployees();
  const regularEmployees = filteredEmployees.filter(emp => 
    !recommendedEmployees.some(rec => rec.id === emp.id)
  );

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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Choose Your AI Employee</h1>
          <p className="hero-subtitle">
            Pick from ready-made AI employees or build one that fits your workflow.
          </p>
          
          <div className="hero-search">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search employees by name, role, or description..."
            />
          </div>

          <div className="hero-filters">
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="selection-main">
        <div className="selection-container">
          {/* Filter Panel */}
          {!filterPanelCollapsed && isMobile && (
            <div 
              className="filter-backdrop"
              onClick={() => setFilterPanelCollapsed(true)}
            />
          )}
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            isCollapsed={filterPanelCollapsed}
            onToggleCollapse={() => setFilterPanelCollapsed(!filterPanelCollapsed)}
            employees={allEmployees}
          />

          {/* Content Area */}
          <div className="content-area">
            {/* Recommended Section */}
            {recommendedEmployees.length > 0 && activeCategory === 'all' && !searchQuery && (
              <RecommendedSection
                employees={recommendedEmployees}
                onSelect={handleEmployeeClick}
                onPreview={handlePreview}
              />
            )}

            {/* Employee Grid */}
            <div className="employees-section">
              <div className="section-header">
                <h2 className="section-title">
                  {activeCategory === 'all' ? 'All Employees' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Employees`}
                  {filteredEmployees.length > 0 && (
                    <span className="employee-count"> ({filteredEmployees.length})</span>
                  )}
                </h2>
              </div>

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
          // Refresh the page to show new employee
          window.location.reload();
        }}
      />
    </div>
  );
}

export default EmployeeSelection;
