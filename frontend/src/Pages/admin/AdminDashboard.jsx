import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { Paper, Grid, Container } from '@mui/material';
import Greeting from '../../Components/Dashboard/GreetingsLayout';
import AdminDashboardLayout from '../../Components/Layouts/AdminDashboardLayout';
import DragDropUploadButton from '../../Components/Buttons/DragDropUploadButton';
import ExportDataButton from '../../Components/Buttons/ExportDataButton';
import { mainItems, reportItems } from '../../Components/Items/AdminDrawerItems';

function AdminDashboard({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="Admin Dashboard"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#000000"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
    <Greeting />
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
              backgroundImage: 'url("../imgs/nsec-admin-dashboard-img.jpg")',
              backgroundRepeat: 'no-repeat',
              backgroundColor: (t) =>
                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <DragDropUploadButton buttonText="Upload Admin Users" endpoint="/upload-users" bgcolor="#000000"></DragDropUploadButton>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: '240', overflow: 'auto' }}>
            <AdminDashboardLayout />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <ExportDataButton buttonText="Extract User Data" endpoint="/api/export-users" bgcolor="#000000"/>
          </Paper>
        </Grid>
      </Grid>
    </Container>
    
    </Dashboard>
  );
}

export default AdminDashboard;