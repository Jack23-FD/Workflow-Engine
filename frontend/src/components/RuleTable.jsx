import React from 'react';
import '../styles/ruleEditor.css';

const RuleTable = ({ rules, steps, onEdit, onDelete }) => {
  if (!rules || rules.length === 0) {
    return (
      <div className="empty-state">
        <svg style={{ width: '48px', height: '48px', margin: '0 auto', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
        <p>No rules defined for this step yet.</p>
      </div>
    );
  }

  // Helper to get step name from ID
  const getStepName = (stepId) => {
    if (!stepId) return <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>End Workflow</span>;
    const step = steps.find(s => s.id === stepId);
    return step ? step.name : <span style={{ color: '#ef4444' }}>Unknown Step ({stepId})</span>;
  };

  return (
    <div className="card">
      <table className="rule-table">
        <thead>
          <tr>
            <th style={{ width: '80px', textAlign: 'center' }}>Priority</th>
            <th>Condition</th>
            <th>Next Step</th>
            <th style={{ width: '150px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.sort((a, b) => a.priority - b.priority).map((rule) => {
            const isDefault = rule.condition.toUpperCase() === 'DEFAULT';
            return (
              <tr key={rule.id}>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#374151' }}>
                  {rule.priority}
                </td>
                <td>
                  <span className={isDefault ? 'condition-cell default-rule' : 'condition-cell'}>
                    {rule.condition}
                  </span>
                </td>
                <td>
                  {getStepName(rule.nextStepId)}
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                    <button 
                      className="btn-edit"
                      onClick={() => onEdit(rule)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-danger"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this rule?')) {
                          onDelete(rule.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RuleTable;
