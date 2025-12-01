import React from 'react';
import { useParams } from 'react-router-dom';
import SmartNoteMaker from '../SmartNoteMaker';
import { getEmployeeById } from '../../data/employees';
import './NotesPage.css';

function NotesPage() {
  const { employeeId } = useParams();
  const employee = getEmployeeById(employeeId);

  return (
    <div className="notes-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">
            Create intelligent notes with AI assistance. Extract content from documents, 
            write manually, or use AI tools to enhance your notes.
          </p>
        </div>
      </div>
      <div className="page-content">
        <SmartNoteMaker 
          employeeName={employee?.name} 
          employeeId={employeeId} 
        />
      </div>
    </div>
  );
}

export default NotesPage;

