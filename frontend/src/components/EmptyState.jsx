import React from 'react';

const EmptyState = ({ icon = '📭', title = 'Nothing here yet', message = '', action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <div className="empty-state-title">{title}</div>
    {message && <p className="empty-state-text">{message}</p>}
    {action && <div style={{ marginTop: 8 }}>{action}</div>}
  </div>
);

export default EmptyState;
