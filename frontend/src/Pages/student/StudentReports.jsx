import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Grid } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/StudentDrawerItems';
import api from '../../Auth/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StudentReports({ drawerOpen, toggleDrawer }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const user = localStorage.getItem('user');
        let userId = JSON.parse(user).id;
        const response = await api.get(`/api/student/${userId}/attendance`);
        setAttendanceData(response.data);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError('Failed to fetch attendance data. Please try again later.');
      }
    };

    fetchAttendanceData();
  }, []);

console.log(attendanceData);

  const lowAttendanceSubjects = attendanceData.filter(subject => subject.attendance_percentage < 75);
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Attendance Percentage by Subject',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const overallChartData = {
    labels: attendanceData.map(subject => subject.subject_name),
    datasets: [
      {
        label: 'Attendance Percentage',
        data: attendanceData.map(subject => subject.attendance_percentage),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
    
  };

  const lowAttendanceChartData = {
    labels: lowAttendanceSubjects.map(subject => subject.subject_name),
    datasets: [
      {
        label: 'Attendance Percentage',
        data: lowAttendanceSubjects.map(subject => subject.attendance_percentage),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  return (
    <Dashboard
      title="Student Reports"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="green"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Box sx={{ flexGrow: 1, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Overall Attendance Summary
              </Typography>
              {error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <Bar options={chartOptions} data={overallChartData} />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Subjects with Attendance Below 75%
              </Typography>
              {lowAttendanceSubjects.length > 0 ? (
                <Bar options={chartOptions} data={lowAttendanceChartData} />
              ) : (
                <Typography>No subjects with attendance below 75%. Keep up the good work!</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Dashboard>
  );
}

export default StudentReports;