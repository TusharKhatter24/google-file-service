import React, { useState } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../data/employees';
import LeftSidebar from './workspace/LeftSidebar';
import RightSidebar from './workspace/RightSidebar';
import './EmployeeWorkspaceLayout.css';

function EmployeeWorkspaceLayout() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const employee = getEmployeeById(employeeId);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  if (!employee) {
    navigate('/employees');
    return null;
  }

  return (
    <div className="employee-workspace">
      <LeftSidebar employee={employee} employeeId={employeeId} />
      <main className="workspace-main">
        <Outlet />
      </main>
      <RightSidebar 
        employee={employee} 
        employeeId={employeeId}
        collapsed={rightSidebarCollapsed}
        onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
      />
    </div>
  );
}

export default EmployeeWorkspaceLayout;

