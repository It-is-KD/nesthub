import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';
import NoticeBoardLayout from '../../Components/Dashboard/NoticeBoardLayout';

function AdminNoticeBoard({ drawerOpen, toggleDrawer }) {
    return (
      <Dashboard 
        title="Admin Dashboard > Notice Board"
        mainItems={mainItems}
        reportItems={reportItems}
        headerColor="#000000"
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
      >
          <NoticeBoardLayout userType="Admin" recipientType="all" />
      </Dashboard>
    );
};

export default AdminNoticeBoard;