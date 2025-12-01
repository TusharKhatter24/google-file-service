import React, { useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { getEmployeeById } from '../data/employees';
import LeftSidebar from './workspace/LeftSidebar';
import RightSidebar from './workspace/RightSidebar';
import './EmployeeWorkspaceLayout.css';

function EmployeeWorkspaceLayout() {
  const { employeeId } = useParams();
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  
  const employee = getEmployeeById(employeeId);

  if (!employee) {
    return (
      <div className="employee-workspace-error">
        <h2>Employee not found</h2>
        <p>The employee you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="employee-workspace-layout">
      <LeftSidebar employee={employee} employeeId={employeeId} />
      
      <main className="workspace-main">
        <Outlet />
      </main>
      
      <RightSidebar 
        employee={employee}
        employeeId={employeeId}
        collapsed={isRightSidebarCollapsed}
        onToggleCollapse={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
      />
    </div>
  );
}

export default EmployeeWorkspaceLayout;

