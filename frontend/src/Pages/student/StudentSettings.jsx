import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/StudentDrawerItems';
import SettingsLayout from '../../Components/Dashboard/SettingsLayout';

function StudentSettings({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Student Dashboard"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="green"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <SettingsLayout />
    </Dashboard>
  );
}

export default StudentSettings;