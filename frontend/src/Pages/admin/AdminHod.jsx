import React, { useState, useEffect } from 'react';
import api from '../../Auth/api';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/AdminDrawerItems';
import DragDropUploadButton from '../../Components/Buttons/DragDropUploadButton';
import ExportDataButton from '../../Components/Buttons/ExportDataButton';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function AdminHod({ drawerOpen, toggleDrawer }) {
  const [hods, setHods] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchHods();
    fetchDepartments();
  }, []);

  const fetchHods = () => {
    api.get('/api/hods')
      .then(response => {
        setHods(response.data);
      })
      .catch(error => {
        console.error('Error fetching HODs:', error);
      });
  };

  const fetchDepartments = () => {
    api.get('/api/departments')
      .then(response => {
        setDepartments(response.data);
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const filteredHods = selectedDepartment
    ? hods.filter(hod => hod.department_name === selectedDepartment)
    : hods;

  return (
    <Dashboard
      title="Admin Dashboard > HOD"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#000000"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="department-select-label">Filter by Department</InputLabel>
                  <Select
                    labelId="department-select-label"
                    id="department-select"
                    value={selectedDepartment}
                    label="Filter by Department"
                    onChange={handleDepartmentChange}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.department_id} value={dept.department_name}>
                        {dept.department_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Typography variant="h6" gutterBottom component="div">
                HODs
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>HOD ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Appointment Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHods.map((hod) => (
                    <TableRow key={hod.hod_id}>
                      <TableCell>{hod.hod_id}</TableCell>
                      <TableCell>{hod.name}</TableCell>
                      <TableCell>{hod.email}</TableCell>
                      <TableCell>{hod.department_name}</TableCell>
                      <TableCell>{hod.appointment_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, mb: 1 }}>
              <DragDropUploadButton buttonText= "Upload HODs" endpoint="/upload-hods" bgcolor="#000000"></DragDropUploadButton>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, mt: 1 }}>
              <ExportDataButton buttonText="Extract HODs" endpoint="/api/export-hods" bgcolor="#000000" />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Dashboard>
  );
}

export default AdminHod;
