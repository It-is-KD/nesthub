import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import NoticeBoardLayout from '../../Components/Dashboard/NoticeBoardLayout';
import { mainItems, reportItems } from '../../Components/Items/TeacherDrawerItems';

function TeacherNotice({ drawerOpen, toggleDrawer }) {
  return (
    <Dashboard
      title="Teacher Dashboard > Notice Board"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#a52a2a"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <NoticeBoardLayout userType="Teacher" recipientType="all" />
    </Dashboard>
  );
}

export default TeacherNotice;
