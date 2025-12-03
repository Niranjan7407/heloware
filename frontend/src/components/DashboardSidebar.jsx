import React from 'react';
import { Home, MessageSquare, Settings, LogOut, Bell } from 'lucide-react';
import Sidebar, { SidebarItem } from './Sidebar.jsx';
import PropTypes from 'prop-types';

export default function DashboardSidebar({
  user,
  onLogout,
  friendRequestCount = 0,
  activeSection = 'home',
  onSectionChange,
}) {
  return (
    <Sidebar user={user} onLogout={onLogout}>
      <SidebarItem
        icon={<Home size={20} />}
        text="Home"
        active={activeSection === 'home'}
        onClick={() => onSectionChange('home')}
      />
      <SidebarItem
        icon={<MessageSquare size={20} />}
        text="Messages"
        alert={friendRequestCount > 0}
        active={activeSection === 'messages'}
        onClick={() => onSectionChange('messages')}
      />
      <SidebarItem
        icon={<Bell size={20} />}
        text="Notifications"
        alert={friendRequestCount > 0}
        active={activeSection === 'notifications'}
        onClick={() => onSectionChange('notifications')}
      />
      <SidebarItem
        icon={<Settings size={20} />}
        text="Settings"
        active={activeSection === 'settings'}
        onClick={() => onSectionChange('settings')}
      />
    </Sidebar>
  );
}

DashboardSidebar.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  friendRequestCount: PropTypes.number,
  activeSection: PropTypes.string,
  onSectionChange: PropTypes.func.isRequired,
};
