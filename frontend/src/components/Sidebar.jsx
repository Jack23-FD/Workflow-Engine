import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Play,
  History,
  ChevronRight,
  Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { group: 'Main', items: [
    { to: '/', label: 'Workflows', icon: <LayoutDashboard size={18} />, exact: true },
    { to: '/executions', label: 'Execution History', icon: <History size={18} /> },
  ]},
];

const Sidebar = () => {
  const location = useLocation();

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <aside className="app-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} color="#fff" />
        </div>
        <div className="sidebar-logo-text">
          Workflow<span>Engine</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.group}>
            <div className="sidebar-section-label">{section.group}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive: ia }) => `sidebar-link ${ia ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        v1.0 &bull; Workflow Engine
      </div>
    </aside>
  );
};

export default Sidebar;
