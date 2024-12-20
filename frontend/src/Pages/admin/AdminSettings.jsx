import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/AdminDrawerItems';
import SettingsLayout from '../../Components/Dashboard/SettingsLayout';

function AdminSettings({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Admin Dashboard > Settings"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#000000"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
    <SettingsLayout />
    </Dashboard>
  );
}

export default AdminSettings;