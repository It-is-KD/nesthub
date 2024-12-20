import React, { useState, useEffect } from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { mainItems, reportItems } from '../../Components/Items/StudentDrawerItems';
import Greeting from '../../Components/Dashboard/GreetingsLayout';
import api from '../../Auth/api';

function StudentDashboard({ drawerOpen, toggleDrawer }) {
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const timeSlots = ['10:00', '11:00', '12:00', '13:30', '14:30', '15:30', '16:30', '17:30'];
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const user = localStorage.getItem('user');
        let userId = JSON.parse(user).id;
        console.log('User ID:', userId);
        const response = await api.get(`/api/student/${userId}/subjects`);
        setSubjects(response.data);
        console.log('Subjects:', response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError('Failed to fetch subjects. Please try again later.');
      }
    };

    fetchSubjects();
  }, []);

  const getSubjectForSlot = (day, time) => {
    const subject = subjects.find(s => 
      s.day_of_week.toLowerCase() === day.toLowerCase() && 
      s.start_time.split(':').slice(0, 2).join(':') === time
    );
    return subject ? subject.subject_name : '';
  };

  return (
    <Dashboard
      title="Student Dashboard"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="green"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Greeting />
      <Box mt={4}>
        <Typography variant="h6" gutterBottom></Typography>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  {timeSlots.map(time => (
                    <TableCell key={time}>{time}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {weekDays.map(day => (
                  <TableRow key={day}>
                    <TableCell>{day}</TableCell>
                    {timeSlots.map(time => (
                      <TableCell key={`${day}-${time}`}>{getSubjectForSlot(day, time)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Dashboard>
  );
}

export default StudentDashboard;