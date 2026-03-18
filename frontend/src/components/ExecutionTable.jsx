import React from 'react';
import '../styles/executionHistory.css';

const ExecutionTable = ({ executions, loading, onViewDetails }) => {
    if (loading) {
        return <div className="loading-state">Loading executions...</div>;
    }

    if (!executions || executions.length === 0) {
        return <div className="empty-state">No execution history found.</div>;
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="execution-table-card">
            <table className="execution-table">
                <thead>
                    <tr>
                        <th>Execution ID</th>
                        <th>Workflow</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Started At</th>
                        <th>Ended At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {executions.map((execution) => (
                        <tr key={execution.id}>
                            <td title={execution.id}>{execution.id.substring(0, 8)}...</td>
                            <td>{execution.workflowName || 'N/A'}</td>
                            <td>v{execution.workflowVersion}</td>
                            <td>
                                <span className={`status-badge status-${execution.status}`}>
                                    {execution.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td>{formatDate(execution.startedAt)}</td>
                            <td>{formatDate(execution.endedAt)}</td>
                            <td>
                                <button 
                                    className="btn-details"
                                    onClick={() => onViewDetails(execution.id)}
                                >
                                    View Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExecutionTable;
