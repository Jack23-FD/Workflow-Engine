import React from 'react';
import '../styles/executionHistory.css';

const ExecutionDetails = ({ execution, onClose }) => {
    if (!execution) return null;

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    const formatJson = (data) => {
        if (!data) return '{}';
        if (typeof data === 'string') {
            try { return JSON.stringify(JSON.parse(data), null, 2); } 
            catch { return data; }
        }
        return JSON.stringify(data, null, 2);
    };

    return (
        <div className="execution-details-overlay" onClick={onClose}>
            <div className="execution-details-modal" onClick={e => e.stopPropagation()}>
                <div className="details-header">
                    <div className="details-title">
                        <h2>Execution Details</h2>
                        <p>ID: {execution.id}</p>
                    </div>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </div>

                <div className="details-content">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Workflow</span>
                            <span className="info-value">{execution.workflowName || 'N/A'} (v{execution.workflowVersion})</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Status</span>
                            <span className={`status-badge status-${execution.status}`}>
                                {execution.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Current Step</span>
                            <span className="info-value">{execution.currentStepName || 'None'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Retries</span>
                            <span className="info-value">{execution.retries}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Triggered By</span>
                            <span className="info-value">{execution.triggeredBy}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Started At</span>
                            <span className="info-value">{formatDate(execution.startedAt)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Ended At</span>
                            <span className="info-value">{formatDate(execution.endedAt)}</span>
                        </div>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Input Data (JSON)</span>
                        <pre className="json-view">{formatJson(execution.data)}</pre>
                    </div>

                    <div className="logs-section">
                        <h3>Execution Path & Logs</h3>
                        {execution.logs && execution.logs.length > 0 ? (
                            <div className="logs-table-container">
                                <table className="logs-table">
                                    <thead>
                                        <tr>
                                            <th>Step</th>
                                            <th>Type</th>
                                            <th>Evaluated Rules</th>
                                            <th>Next Step</th>
                                            <th>Status / Error</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {execution.logs.map(log => (
                                            <tr key={log.id}>
                                                <td>{log.stepName}</td>
                                                <td>{log.stepType}</td>
                                                <td>
                                                    {log.evaluatedRules ? (
                                                        <pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                                            {formatJson(log.evaluatedRules)}
                                                        </pre>
                                                    ) : '-'}
                                                </td>
                                                <td>{log.selectedNextStep || '-'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span className={`status-badge status-${log.status.toLowerCase()}`}>
                                                            {log.status}
                                                        </span>
                                                        {log.errorMessage && (
                                                            <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>
                                                                {log.errorMessage}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                    <div>Start: {formatDate(log.startedAt)}</div>
                                                    <div>End: {formatDate(log.endedAt)}</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-state" style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                No logs available for this execution.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutionDetails;
