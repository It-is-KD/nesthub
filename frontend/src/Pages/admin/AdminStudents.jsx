import React, { useState, useEffect } from 'react';
import api from '../../Auth/api';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/AdminDrawerItems';
import DragDropUploadButton from '../../Components/Buttons/DragDropUploadButton';
import ExportDataButton from '../../Components/Buttons/ExportDataButton';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminStudents({ drawerOpen, toggleDrawer }) {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [studentStats, setStudentStats] = useState({});

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    fetchStudentStats();
  }, []);

  const fetchStudents = () => {
    api.get('/api/students')
      .then(response => {
        setStudents(response.data);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
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

  const fetchStudentStats = () => {
    api.get('/api/student-stats')
      .then(response => {
        setStudentStats(response.data);
      })
      .catch(error => {
        console.error('Error fetching student stats:', error);
      });
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const filteredStudents = selectedDepartment
    ? students.filter(student => student.department_name === selectedDepartment)
    : students;

    const chartData = {
      labels: [selectedDepartment || 'All Departments'],
      datasets: [
        {
          label: 'Number of Students',
          data: [selectedDepartment ? studentStats[selectedDepartment] : Object.values(studentStats).reduce((a, b) => a + b, 0)],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
    

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Students per Department',
      },
    },
  };

  return (
    <Dashboard
      title="Admin Dashboard > Students"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#000000"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs= {12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
              <DragDropUploadButton buttonText= "Upload Students" endpoint="/upload-students" bgcolor="#000000"></DragDropUploadButton>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
              <ExportDataButton buttonText= "Extract Student Data" endpoint="/api/export-students" bgcolor="#000000" />
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
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
              <Typography variant="h6" gutterBottom component="div">
                Students
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Batch</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Semester</TableCell>
                    <TableCell>Admission Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>{student.department_name}</TableCell>
                      <TableCell>{student.batch_name}</TableCell>
                      <TableCell>{student.section_name}</TableCell>
                      <TableCell>{student.current_semester}</TableCell>
                      <TableCell>{student.admission_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
              <Typography variant="h6" gutterBottom component="div">
                Student Distribution
              </Typography>
              <Bar data={chartData} options={chartOptions} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Dashboard>
  );
}

export default AdminStudents;
