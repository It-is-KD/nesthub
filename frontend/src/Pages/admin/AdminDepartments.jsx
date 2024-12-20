import React, { useState, useEffect } from 'react';
import api from '../../Auth/api';
import Dashboard from '../../Components/Dashboard/Dashboard';
import DragDropUploadButton from '../../Components/Buttons/DragDropUploadButton';
import ExportDataButton from '../../Components/Buttons/ExportDataButton';
import { Bar } from 'react-chartjs-2';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { mainItems, reportItems } from '../../Components/Items/AdminDrawerItems';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDepartments({ drawerOpen, toggleDrawer }) {

  const [departments, setDepartments] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [filterType, setFilterType] = useState('students');

  useEffect(() => {
    fetchDepartments();
    fetchDepartmentData();
  }, []);

  const fetchDepartments = () => {
    api.get('/api/departments')
      .then(response => {
        setDepartments(response.data);
      })
      .catch(error => {
        console.error('Error fetching departments:', error);
      });
  };

  const fetchDepartmentData = () => {
    api.get('/api/department-stats')
      .then(response => {
        setDepartmentData(response.data);
      })
      .catch(error => {
        console.error('Error fetching department stats:', error);
      });
  };

  const chartData = {
    labels: departmentData.map(d => d.department_id),
    datasets: [
      {
        label: filterType === 'students' ? 'Number of Students' : 'Number of Teachers',
        data: departmentData.map(d => filterType === 'students' ? d.student_count : d.teacher_count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${filterType === 'students' ? 'Students' : 'Teachers'} per Department`,
      },
    },
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  return (
    <Dashboard
      title="Admin Dashboard > Departments"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#000000"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: '240px', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom component="div">
                Departments
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Department ID</TableCell>
                    <TableCell>Department Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departments.map((department) => (
                    <TableRow key={department.department_id}>
                      <TableCell>{department.department_id}</TableCell>
                      <TableCell>{department.department_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
              <DragDropUploadButton buttonText="Upload Department" endpoint="/upload-departments" bgcolor="#000000"></DragDropUploadButton>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8} lg={9}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', maxHeight: '100vh', overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Department Statistics
              </Typography>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="filter-select-label">Filter</InputLabel>
                <Select
                  labelId="filter-select-label"
                  id="filter-select"
                  value={filterType}
                  label="Filter"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="students">Students</MenuItem>
                  <MenuItem value="teachers">Teachers</MenuItem>
                </Select>
              </FormControl>
              <div style={{ width: '100%', height: '500px' }}>
                <Bar options={chartOptions} data={chartData} />
              </div>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
              <ExportDataButton buttonText="Extract Department Data" endpoint="/api/export-departments" bgcolor="#000000" />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Dashboard>
  );
}

export default AdminDepartments;