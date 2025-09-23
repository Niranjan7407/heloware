import React from 'react';
import { Home, MessageSquare, Settings } from 'lucide-react';
import Sidebar, { SidebarItem } from './Sidebar.jsx';

export default function DashboardSidebar() {
  return (
    <Sidebar>
      <SidebarItem icon={<Home size={20} />} text="Home" active />
      <SidebarItem icon={<MessageSquare size={20} />} text="Messages" alert />
      <SidebarItem icon={<Settings size={20} />} text="Settings" />
    </Sidebar>
  );
}
