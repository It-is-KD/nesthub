import React, { useState } from 'react';
import { TextField, List, ListItem, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../../Auth/api';
import { useAlert } from '../../Hooks/AlertContext';

const AttendanceLayout = ({ classes, filterOptions, filters, handleFilterChange, weekDates, currentWeek, setCurrentWeek }) => {

  const { showAlert } = useAlert();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const presentCount = students.filter(student => student.isPresent).length;

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAttendance = async (schedule) => {
    setSelectedSchedule(schedule);
    try {
      const selectedDate = weekDates.find(date => 
        date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === schedule.day_of_week.toLowerCase()
      );
      const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
      const formattedDate = adjustedDate.toISOString().split('T')[0];

      const response = await api.get(`/api/view-attendance/${schedule.schedule_id}/${formattedDate}`);
      const studentsWithAttendance = response.data.map(student => ({
        ...student,
        isPresent: student.status === 'Present'
      }));
      setStudents(studentsWithAttendance);
      setOpenDialog(true);
    } catch (error) {
      showAlert('Error fetching students: ' +error.message, 'error');
    }
  };

  const handleAttendanceChange = (studentId) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.student_id === studentId
          ? { ...student, isPresent: !student.isPresent }
          : student
      )
    );
  };
  
  // useEffect(() => {
  //   const startDate = addDays(startOfWeek(new Date()), currentWeek * 7 + 1);
  //   const dates = Array.from({ length: 6 }, (_, i) => addDays(startDate, i));
    
  // }, [currentWeek]);
  

  const handleSubmitAttendance = async () => {
    try {
      const attendanceData = students.reduce((acc, student) => {
        acc[student.student_id] = student.isPresent ? 'Present' : 'Absent';
        return acc;
      }, {});
  
      const selectedDate = weekDates.find(date => 
        date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === selectedSchedule.day_of_week.toLowerCase()
      );
  
      const adjustedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
      const formattedDate = adjustedDate.toISOString().split('T')[0];
      const response = await api.post('/api/submit-attendance', {
        scheduleId: selectedSchedule.schedule_id,
        date: formattedDate,
        attendance: attendanceData
      });
  
      if (response.data.success) {
        showAlert('Attendance submitted successfully', 'success');
      } else {
        showAlert('Error submitting attendance: ' + response.data.message, 'error');
      }
  
      setOpenDialog(false);
    } catch (error) {
      showAlert('Error submitting attendance: ' + error.message, 'error');
    }
  };
    
  
  const handleViewAttendance = async (schedule) => {
    setSelectedSchedule(schedule);
    try {
      const response = await api.get(`/api/view-attendance/${schedule.schedule_id}/${weekDates[1].toISOString().split('T')[0]}`);
      setStudents(response.data);
      setOpenDialog(true);
    } catch (error) {
      showAlert('Error fetching attendance: ' + error.message, 'error');
    }
  };
  
  

  const timeSlots = ['10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:30 - 14:30', '14:30 - 15:30', '15:30 - 16:30', '16:30 - 17:30'];

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }} justifyContent="center">
        {Object.entries(filterOptions).map(([key, options]) => (
          <Grid item xs={12} md={2} key={key}>
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

      <TableContainer component={Paper} elevation={3}>
      <Table>
          <TableHead>
            <TableRow>
              <TableCell>Day</TableCell>
              {timeSlots.map((timeSlot) => (
                <TableCell key={timeSlot} align="center">{timeSlot}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {weekDates.map((date) => (
              <TableRow key={date.toString()}>
                <TableCell>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}<br />
                  {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                </TableCell>
                {timeSlots.map((timeSlot) => (
                  <TableCell key={timeSlot} align="center">
                    {classes
                      .filter(schedule => {
                        const scheduleDay = schedule.day_of_week.toLowerCase();
                        const currentDay = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                        const [slotStart, slotEnd] = timeSlot.split(' - ');
                        return scheduleDay === currentDay && 
                              schedule.start_time <= slotEnd &&
                              schedule.end_time >= slotEnd;
                      })
                      .map(schedule => (
                        <Box key={schedule.schedule_id}>
                          <Typography variant="body2" gutterBottom>
                            {schedule.subject_name}
                          </Typography>
                          <Typography variant="caption" display="block" gutterBottom>
                            {`${schedule.batch_name} ${schedule.section_name}`}
                          </Typography>
                          {currentWeek === 0 && (
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              onClick={() => handleOpenAttendance(schedule)}
                            >
                              Take Attendance
                            </Button>
                          )}
                          {currentWeek < 0 && (
                            <Button
                              variant="contained"
                              color="secondary"
                              size="small"
                              onClick={() => handleViewAttendance(schedule)}
                            >
                              View Attendance
                            </Button>
                          )}

                        </Box>
                      ))
                    }
                  </TableCell>
                ))}

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {currentWeek === 0 ? 'Take Attendance' : 'View Attendance'}
            </Typography>
            {currentWeek === 0 && (
              <TextField
                placeholder="Search students..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
          </Box>
          {selectedSchedule && (
            <Typography variant="subtitle1">
              {`${selectedSchedule.subject_name} - ${selectedSchedule.section_name}`}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <List sx={{ maxHeight: 400 }}>
            {currentWeek === 0 ? (
              filteredStudents.map(student => (
                <ListItem key={student.student_id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={student.isPresent}
                        onChange={() => handleAttendanceChange(student.student_id)}
                        color="primary"
                      />
                    }
                    label={`${student.name} (${student.student_id})`}
                  />
                </ListItem>
              ))
            ) : (
              students.map(student => (
                <ListItem key={student.student_id}>
                  <ListItemText 
                    primary={`${student.name} (${student.student_id})`}
                    secondary={student.status}
                  />
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        {currentWeek === 0 && (
          <DialogActions>
            <Typography variant="body1" sx={{ mr: 2 }}>
              P: {presentCount}
            </Typography>
            <Button 
              onClick={() => {
                setStudents(students.map(student => ({ ...student, isPresent: true })));
              }}
              color="primary"
            >
              Mark All Present
            </Button>
            <Button onClick={() => setOpenDialog(false)} color="secondary">Cancel</Button>
            <Button onClick={handleSubmitAttendance} color="primary" variant="contained">Submit</Button>
          </DialogActions>
        )}
      </Dialog>
      </Box>
  );
};

export default AttendanceLayout;
