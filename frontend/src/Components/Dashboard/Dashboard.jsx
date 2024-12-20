import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import NavbarLayout from '../Navbars/NavbarLayout';
import { useMediaQuery, Avatar } from '@mui/material';
import NavbarMobile from '../Navbars/NavbarMobile';
import api from '../../Auth/api';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © Made by '}
      <Link color="inherit" href="https://khush-portfolio.netlify.app/" target="_blank" style={{ display: 'inline-flex', alignItems: 'center'}}>
        Khush Desai
        <Avatar
          src="./../imgs/ICO-1.png"
          alt="logo"
          sx={{
            marginLeft: 1,
            width: 20,
            height: 20,
            verticalAlign: 'middle',
          }}
        ></Avatar>
      </Link>
    </Typography>
  );
}

function Dashboard({ title, mainItems, reportItems, headerColor, children, drawerOpen, toggleDrawer }) {
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(response.data.user.name);
        setUserRole(response.data.user.role);
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    fetchUserName();
  }, []);
  const isMobile = useMediaQuery('(max-width:600px)');
  return (
    <>
      {isMobile ? (
        <NavbarMobile
          title={title}
          mainItems={mainItems}
          reportItems={reportItems}
          headerColor={headerColor}
        >
          {children}
        <Copyright sx={{ mt: 5 }} />
        </NavbarMobile>
      ) : (
        <NavbarLayout
          title={title}
          mainItems={mainItems}
          reportItems={reportItems}
          headerColor={headerColor}
          drawerOpen={drawerOpen}
          toggleDrawer={toggleDrawer}
          userName={userName}
          userRole={userRole}
        >
          {children}
        <Copyright sx={{ mt: 5 }} />
        </NavbarLayout>
      )}
    </>
  );
}

export default Dashboard;