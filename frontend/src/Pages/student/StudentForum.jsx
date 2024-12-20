import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/StudentDrawerItems';
import ForumLayout from '../../Components/Dashboard/ForumLayout';

function StudentForum({ drawerOpen, toggleDrawer }) {
  
  return (
    <Dashboard
      title="Student Dashboard > Forum"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="green"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <ForumLayout userType="student" recipientType="teacher" />
    </Dashboard>
  );
}

export default StudentForum;