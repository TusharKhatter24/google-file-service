import React from 'react';
import { useParams } from 'react-router-dom';
import { getEmployeeById } from '../../data/employees';
import ChatInterface from '../ChatInterface';
import './ConversationsPage.css';

function ConversationsPage() {
  const { employeeId } = useParams();
  const employee = getEmployeeById(employeeId);

  return (
    <div className="conversations-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Conversations</h1>
          <p className="page-subtitle">Chat with {employee.name} and get instant answers from your knowledge base.</p>
        </div>
      </div>
      <div className="conversations-content">
        <ChatInterface employeeName={employee.name} employeeId={employeeId} />
      </div>
    </div>
  );
}

export default ConversationsPage;

