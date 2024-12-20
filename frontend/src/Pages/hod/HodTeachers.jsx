import React, { useState, useEffect } from 'react';
import api from '../../Auth/api';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';
import ExportDataButton from '../../Components/Buttons/ExportDataButton';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

function HodTeachers({ drawerOpen, toggleDrawer }) {
  
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = () => {
    api.get('/api/hod-teachers')
      .then(response => {
        setTeachers(response.data);
      console.log(teachers);

      })
      .catch(error => {
        console.error('Error fetching teachers:', error);
      });
  };

  return (
    <Dashboard
      title="HOD Dashboard > Teachers"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#00008B"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: '1000px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom component="div">
                Department Teachers
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Teacher ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Joining Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teachers.map((teacher) => (
                    <TableRow key={teacher.teacher_id}>
                      <TableCell>{teacher.teacher_id}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.phone}</TableCell>
                      <TableCell>{teacher.joining_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, mt: 1 }}>
              <ExportDataButton buttonText="Extract Teacher Data" endpoint="/api/export-teachers-hod" bgcolor="#00008B" />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Dashboard>
  );
}

export default HodTeachers;
