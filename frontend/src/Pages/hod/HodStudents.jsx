import React, { useState, useEffect } from 'react';
import api from '../../Auth/api';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';
import ExportDataButton from '../../Components/Buttons/ExportDataButton';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function HodStudents({ drawerOpen, toggleDrawer }) {

  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    batch: '',
    semester: '',
    section: ''
  });
  
  const [filterOptions, setFilterOptions] = useState({
    batches: [],
    semesters: [],
    sections: []
  });

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  const fetchStudents = () => {
    api.get('/api/hod-students', { params: filters })
      .then(response => {
        setStudents(response.data);
        updateFilterOptions(response.data);
      })
      .catch(error => {
        console.error('Error fetching students:', error);
      });
  };

  const updateFilterOptions = (data) => {
    const uniqueBatches = [...new Set(data.map(student => student.batch_name))];
    const uniqueSemesters = [...new Set(data.map(student => student.current_semester))];
    const uniqueSections = [...new Set(data.map(student => student.section_name))];
    
    setFilterOptions({
      batches: uniqueBatches,
      semesters: uniqueSemesters,
      sections: uniqueSections
    });
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  return (
    <Dashboard
      title="HOD Dashboard > Students"
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
                Department Students
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {Object.entries(filterOptions).map(([key, options]) => (
                  <Grid item xs={12} md={4} key={key}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</InputLabel>
                      <Select
                        name={key.slice(0, -1)}
                        value={filters[key.slice(0, -1)]}
                        onChange={handleFilterChange}
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                      >
                        <MenuItem value="">All</MenuItem>
                        {options.map(option => (
                          <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                ))}
              </Grid>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Batch</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Current Semester</TableCell>
                    <TableCell>Admission Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phone}</TableCell>
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
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240, mt: 1 }}>
              <ExportDataButton buttonText="Extract Student Data" endpoint="/api/export-students-hod" bgcolor="#00008B" />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Dashboard>
  );
}

export default HodStudents;
