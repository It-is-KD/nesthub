import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import ForumLayout from '../../Components/Dashboard/ForumLayout';
import { mainItems, reportItems } from '../../Components/Items/TeacherDrawerItems';

function TeacherForum({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Teacher Dashboard > Forum"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#a52a2a"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <ForumLayout userType="teacher" recipientType="student" />
    </Dashboard>
  );
}

export default TeacherForum;