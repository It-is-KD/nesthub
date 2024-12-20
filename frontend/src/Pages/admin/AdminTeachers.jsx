import React, { useState, useEffect } from 'react';
import api from '../../Auth/api';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/AdminDrawerItems';
import DragDropUploadButton from '../../Components/Buttons/DragDropUploadButton';
import ExportDataButton from '../../Components/Buttons/ExportDataButton';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function AdminTeachers({ drawerOpen, toggleDrawer }) {

  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const fetchTeachers = () => {
    api.get('/api/teachers')
      .then(response => {
        setTeachers(response.data);
      })
      .catch(error => {
        console.error('Error fetching teachers:', error);
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

  const filteredTeachers = selectedDepartment
    ? teachers.filter(teacher => teacher.department_name === selectedDepartment)
    : teachers;

  return (
    <Dashboard
      title="Admin Dashboard > Teachers"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#000000"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
    
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={9}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: '1000px', overflow: 'auto' }}>
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
                Teachers
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Teacher ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Joining Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.teacher_id}>
                      <TableCell>{teacher.teacher_id}</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>{teacher.department_name}</TableCell>
                      <TableCell>{teacher.joining_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, mb: 1 }}>
              <DragDropUploadButton buttonText= "Upload Teachers" endpoint="/upload-teachers" bgcolor="#000000"></DragDropUploadButton>
            </Paper>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, mt: 1 }}>
              <ExportDataButton buttonText="Extract Teacher Data" endpoint="/api/export-teachers" bgcolor="#000000" />
            </Paper>
          </Grid>
        </Grid>
      </Container>

    </Dashboard>
  );
}

export default AdminTeachers;