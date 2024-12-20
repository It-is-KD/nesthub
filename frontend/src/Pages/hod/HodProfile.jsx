import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';
import ProfileLayout from '../../Components/Dashboard/ProfileLayout';

function HodProfile({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="HOD Dashboard > Profile"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#00008B"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <ProfileLayout />
    </Dashboard>
  );
}

export default HodProfile;
