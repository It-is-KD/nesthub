import React, { useState, useEffect } from 'react';
import api from '../../Auth/api';
import Dashboard from '../../Components/Dashboard/Dashboard';
import Greeting from '../../Components/Dashboard/GreetingsLayout';
import { Paper, Box } from '@mui/material';
import { mainItems, reportItems } from '../../Components/Items/TeacherDrawerItems';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TeacherSchedule({ drawerOpen, toggleDrawer }) {

  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const response = await api.get('/api/teacher/attendance-summary');
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const chartData = {
    labels: Object.keys(attendanceData),
    datasets: [
      {
        label: 'Attending Students',
        data: Object.values(attendanceData).map(d => d.attending),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Students',
        data: Object.values(attendanceData).map(d => d.total),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
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
        text: 'Student Attendance by Subject',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Students',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Subjects',
        },
      },
    },
  };
  
  return (
    <Dashboard
      title="Teacher Dashboard > Schedule"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#a52a2a"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
    <Greeting />
      <Box sx={{ p: 2 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Bar data={chartData} options={chartOptions} />
        </Paper>
      </Box>

    </Dashboard>
  );
}

export default TeacherSchedule;