import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/AdminDrawerItems';
import ProfileLayout from '../../Components/Dashboard/ProfileLayout';

function AdminProfile({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Admin Dashboard > Profile"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#000000"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <ProfileLayout />
    </Dashboard>
  );
}

export default AdminProfile;