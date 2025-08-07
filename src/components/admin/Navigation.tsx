import React from 'react';
import './Navigation.css';

interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
}

interface NavigationProps {
  items: NavigationItem[];
  logo?: React.ReactNode;
  userInfo?: {
    name: string;
    avatar?: string;
    role: string;
  };
  onItemClick?: (path: string) => void;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  items,
  logo,
  userInfo,
  onItemClick,
  onLogout
}) => {
  return (
    <nav className="vitgo-nav">
      <div className="vitgo-nav-header">
        {logo && <div className="vitgo-nav-logo">{logo}</div>}
      </div>
      
      <div className="vitgo-nav-items">
        {items.map((item, index) => (
          <button
            key={index}
            className={`vitgo-nav-item ${item.active ? 'vitgo-nav-item--active' : ''}`}
            onClick={() => onItemClick?.(item.path)}
          >
            {item.icon && <span className="vitgo-nav-item-icon">{item.icon}</span>}
            <span className="vitgo-nav-item-label">{item.label}</span>
            {item.badge && (
              <span className="vitgo-nav-item-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </div>

      {userInfo && (
        <div className="vitgo-nav-user">
          <div className="vitgo-nav-user-info">
            {userInfo.avatar ? (
              <img src={userInfo.avatar} alt={userInfo.name} className="vitgo-nav-user-avatar" />
            ) : (
              <div className="vitgo-nav-user-avatar vitgo-nav-user-avatar--default">
                {userInfo.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="vitgo-nav-user-details">
              <div className="vitgo-nav-user-name">{userInfo.name}</div>
              <div className="vitgo-nav-user-role">{userInfo.role}</div>
            </div>
          </div>
          {onLogout && (
            <button className="vitgo-nav-logout" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
