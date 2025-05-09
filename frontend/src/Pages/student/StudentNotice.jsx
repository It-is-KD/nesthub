import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import NoticeBoardLayout from '../../Components/Dashboard/NoticeBoardLayout';
import { mainItems, reportItems } from '../../Components/Items/StudentDrawerItems';

function StudentNotice({ drawerOpen, toggleDrawer }) {
  return (
    <Dashboard
      title="Student Dashboard > Notice Board"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="green"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <NoticeBoardLayout userType="Student" recipientType="all" />
    </Dashboard>
  );
}

export default StudentNotice;
