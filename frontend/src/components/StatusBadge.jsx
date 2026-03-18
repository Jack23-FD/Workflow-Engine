import React from 'react';

const statusMap = {
  completed:   { cls: 'badge-success', label: 'Completed' },
  failed:      { cls: 'badge-danger',  label: 'Failed'    },
  in_progress: { cls: 'badge-info',    label: 'In Progress'},
  pending:     { cls: 'badge-warning', label: 'Pending'   },
  canceled:    { cls: 'badge-gray',    label: 'Canceled'  },
  rejected:    { cls: 'badge-danger',  label: 'Rejected'  },
  COMPLETED:   { cls: 'badge-success', label: 'Completed' },
  FAILED:      { cls: 'badge-danger',  label: 'Failed'    },
  IN_PROGRESS: { cls: 'badge-info',    label: 'In Progress'},
  PENDING:     { cls: 'badge-warning', label: 'Pending'   },
  CANCELED:    { cls: 'badge-gray',    label: 'Canceled'  },
  REJECTED:    { cls: 'badge-danger',  label: 'Rejected'  },
  // Step types
  task:         { cls: 'badge-primary', label: 'Task'        },
  approval:     { cls: 'badge-warning', label: 'Approval'    },
  notification: { cls: 'badge-info',    label: 'Notification'},
  // Active / Inactive
  active:   { cls: 'badge-success', label: 'Active'   },
  inactive: { cls: 'badge-gray',    label: 'Inactive' },
};

const StatusBadge = ({ status, dot = true, customLabel }) => {
  const key = (status || '').toLowerCase();
  const map = statusMap[status] || statusMap[key] || { cls: 'badge-gray', label: status || '—' };
  return (
    <span className={`badge ${map.cls} ${dot ? 'badge-dot' : ''}`}>
      {customLabel || map.label}
    </span>
  );
};

export default StatusBadge;
