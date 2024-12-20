import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/TeacherDrawerItems';
import SettingsLayout from '../../Components/Dashboard/SettingsLayout';

function TeacherSettings({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Teacher Dashboard > Settings"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#a52a2a"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
    <SettingsLayout />
    </Dashboard>
  );
}

export default TeacherSettings;
