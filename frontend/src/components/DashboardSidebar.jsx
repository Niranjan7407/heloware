import React from 'react';
import { Home, MessageSquare, Settings, LogOut, Bell } from 'lucide-react';
import Sidebar, { SidebarItem } from './Sidebar.jsx';
import PropTypes from 'prop-types';

export default function DashboardSidebar({
  user,
  onLogout,
  friendRequestCount = 0,
}) {
  return (
    <Sidebar user={user} onLogout={onLogout}>
      <SidebarItem icon={<Home size={20} />} text="Home" active />
      <SidebarItem
        icon={<MessageSquare size={20} />}
        text="Messages"
        alert={friendRequestCount > 0}
      />
      <SidebarItem
        icon={<Bell size={20} />}
        text="Notifications"
        alert={friendRequestCount > 0}
      />
      <SidebarItem icon={<Settings size={20} />} text="Settings" />
    </Sidebar>
  );
}

DashboardSidebar.propTypes = {
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
  friendRequestCount: PropTypes.number,
};
