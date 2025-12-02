import React from 'react';
import SmartNoteMaker from '../SmartNoteMaker';
import './SkillsShared.css';

function NoteTaking({ employeeName, employeeId }) {
  return (
    <div className="skill-content">
      <div className="skill-content-header">
        <h2>Smart Notes</h2>
        <p>{employeeName} helps you capture and organize notes</p>
      </div>

      <SmartNoteMaker employeeName={employeeName} employeeId={employeeId} />
    </div>
  );
}

export default NoteTaking;

