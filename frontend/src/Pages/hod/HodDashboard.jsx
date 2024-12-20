import React from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Box } from '@mui/material';
import Greeting from '../../Components/Dashboard/GreetingsLayout';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';

function HodDashboard({ drawerOpen, toggleDrawer }) {

  return (
    <Dashboard
      title="HOD Dashboard"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#00008B"
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                border: '2px dashed #ccc',
                borderRadius: 2,
                padding: 3,
              }}
            >
            Coming soon!
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>

    </Dashboard>
  );
}

export default HodDashboard;