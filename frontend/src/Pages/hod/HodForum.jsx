import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import ForumLayout from '../../Components/Dashboard/ForumLayout';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';

function HodForum({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Teacher Dashboard > Forum"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#00008B"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <ForumLayout userType="hod" recipientType="student" />
    </Dashboard>
  );
}

export default HodForum;