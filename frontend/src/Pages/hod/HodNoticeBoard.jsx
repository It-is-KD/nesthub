import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';
import NoticeBoardLayout from '../../Components/Dashboard/NoticeBoardLayout';

function HodNoticeBoard({ drawerOpen, toggleDrawer }) {
    return (
      <Dashboard 
        title="HOD Dashboard > Notice Board"
        mainItems={mainItems}
        reportItems={reportItems}
        headerColor="#00008B"
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
      >
          <NoticeBoardLayout userType="HOD" recipientType="all" />
      </Dashboard>
    );
};

export default HodNoticeBoard;