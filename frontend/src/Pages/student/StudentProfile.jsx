import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import ProfileLayout from '../../Components/Dashboard/ProfileLayout';
import { mainItems, reportItems } from '../../Components/Items/StudentDrawerItems';

function StudentProfile({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Student Dashboard > Profile"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="green"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      {/* Add teacher-specific content here */}
      {/* You can add more components or content specific to the teacher dashboard */}
      <ProfileLayout />
    </Dashboard>
  );
}

export default StudentProfile;