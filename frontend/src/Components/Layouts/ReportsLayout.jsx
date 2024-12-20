import React, { useState } from 'react';
import { Select, MenuItem, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Typography, Box } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import ExportDataButton from '../Buttons/ExportDataButton';

function ReportsLayout({ color, subjects, selectedSubject, setSelectedSubject, attendanceData, lowAttendanceStudents, sendNotification, sendNotificationToAll, filterOptions, filters, handleFilterChange }) {
  const pieChartData = {
    labels: ['Above 75%', 'Below 75%'],
    datasets: [{
      data: [attendanceData.aboveThreshold, attendanceData.belowThreshold],
      backgroundColor: ['#36A2EB', '#FF6384']
    }]
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = lowAttendanceStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <Grid container spacing={2} p={3}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8} lg={9}>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              fullWidth
            >
              {subjects.map(subject => (
                <MenuItem key={subject.id} value={subject.id}>{subject.name}</MenuItem>
              ))}
            </Select>
            <TableContainer component={Paper} sx={{ p: 2, display: 'flex', flexDirection: 'column', marginTop: '3px', maxHeight: '250px', overflowY: 'auto' }}>
              <Table>
                <TableHead>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <TextField
                      placeholder="Search students..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => sendNotificationToAll(lowAttendanceStudents.map(student => student.id))}
                      sx={{ width: '250px' }}
                    >
                      Send Notification to All
                    </Button>
                  </Grid>
                </Grid>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Attendance Percentage</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map(student => (
                    <TableRow key={student.id} value={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.attendancePercentage}%</TableCell>
                      <TableCell>
                        <Button onClick={() => sendNotification(student.id)}>
                          Send Notification
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%', 
              justifyContent: 'center', 
              alignItems: 'center'
            }}>
              <Box sx={{ width: '100%', maxWidth: 300, aspectRatio: '1/1' }}>
                <Pie data={pieChartData} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Start Date"
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="End Date"
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                value={filters.department}
                onChange={handleFilterChange}
                name="department"
                fullWidth
                displayEmpty
              >
                <MenuItem value="">All Departments</MenuItem>
                {filterOptions.departments.map(dept => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                value={filters.batch}
                onChange={handleFilterChange}
                name="batch"
                fullWidth
                displayEmpty
              >
                <MenuItem value="">All Batches</MenuItem>
                {filterOptions.batches.map(batch => (
                  <MenuItem key={batch.id} value={batch.id}>{batch.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                value={filters.semester}
                onChange={handleFilterChange}
                name="semester"
                fullWidth
                displayEmpty
              >
                <MenuItem value="">All Semesters</MenuItem>
                {filterOptions.semesters.map(semester => (
                  <MenuItem key={semester} value={semester}>{semester}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Select
                value={filters.section}
                onChange={handleFilterChange}
                name="section"
                fullWidth
                displayEmpty
              >
                <MenuItem value="">All Sections</MenuItem>
                {filterOptions.sections.map(section => (
                  <MenuItem key={section} value={section}>{section}</MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6} sm={3}>
        <ExportDataButton
          buttonText="Export Filtered Data"
          endpoint="/api/export-filtered-attendance"
          bgcolor={color}
          params={{ ...filters, subjectId: selectedSubject }}
        />
      </Grid>
      <Grid item xs={12} md={6} sm={3}>
        <ExportDataButton
          buttonText="Extract Detailed Attendance"
          endpoint="/api/export-attendance"
          bgcolor={color}
          params={{ ...filters, subjectId: selectedSubject }}
        />
      </Grid>
    </Grid>
  );
}

export default ReportsLayout;