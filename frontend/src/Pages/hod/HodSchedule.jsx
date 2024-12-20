import React, { useState, useEffect } from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { addDays, startOfWeek } from 'date-fns';
import api from '../../Auth/api';
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';
import ScheduleLayout from '../../Components/Layouts/ScheduleLayout';

function HodSchedule({ drawerOpen, toggleDrawer }) {
  const [classes, setClasses] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [weekDates, setWeekDates] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchSchedule();
    }
  }, [selectedSemester]);

  useEffect(() => {
    const startDate = addDays(startOfWeek(new Date()), currentWeek * 7 + 1);
    const dates = Array.from({ length: 6 }, (_, i) => addDays(startDate, i));
    setWeekDates(dates);
  }, [currentWeek]);

  const fetchSemesters = async () => {
    try {
      const response = await api.get('/api/semesters');
      setSemesters(response.data);
      if (response.data.length > 0) {
        setSelectedSemester(response.data[0].semester);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await api.get(`/api/department-schedule/${selectedSemester}`);
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
  };

  const timeSlots = ['10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '13:30 - 14:30', '14:30 - 15:30', '15:30 - 16:30', '16:30 - 17:30'];

  const renderCellContent = (date, timeSlot, classes) => {
    return classes
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
          <Typography variant="caption" display="block" gutterBottom>
            {schedule.teacher_name}
          </Typography>
        </Box>
      ));
  };

  return (
    <Dashboard
      title="HOD Dashboard > Department Schedule"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#00008B"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Box sx={{ mb: 2, mt: 3, px: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="semester-select-label">Semester</InputLabel>
          <Select
            labelId="semester-select-label"
            id="semester-select"
            value={selectedSemester}
            label="Semester"
            onChange={handleSemesterChange}
          >
            {semesters.map((semester) => (
              <MenuItem key={semester} value={semester}>
                {semester}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <ScheduleLayout 
        classes={classes}
        weekDates={weekDates}
        timeSlots={timeSlots}
        renderCellContent={renderCellContent}
      />
    </Dashboard>
  );
}

export default HodSchedule;