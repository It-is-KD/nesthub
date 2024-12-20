import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';
import SettingsLayout from '../../Components/Dashboard/SettingsLayout';

function HodSettings({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="HOD Dashboard > Settings"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#00008B"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
    <SettingsLayout />
    </Dashboard>
  );
}

export default HodSettings;
