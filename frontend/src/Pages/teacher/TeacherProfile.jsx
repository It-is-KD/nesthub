import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import ProfileLayout from '../../Components/Dashboard/ProfileLayout';
import { mainItems, reportItems } from '../../Components/Items/TeacherDrawerItems';

function TeacherProfile({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Teacher Dashboard > Profile"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#a52a2a"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      {/* Add teacher-specific content here */}
      {/* You can add more components or content specific to the teacher dashboard */}
      <ProfileLayout />
    </Dashboard>
  );
}

export default TeacherProfile;