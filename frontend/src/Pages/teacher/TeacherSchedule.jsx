import React, { useState, useEffect } from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { Box, Typography } from '@mui/material';
import { addDays, startOfWeek } from 'date-fns';
import api from '../../Auth/api';
import { mainItems, reportItems } from '../../Components/Items/TeacherDrawerItems';
import ScheduleLayout from '../../Components/Layouts/ScheduleLayout';

function TeacherSchedule({ drawerOpen, toggleDrawer }) {
  const [classes, setClasses] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    const startDate = addDays(startOfWeek(new Date()), currentWeek * 7 + 1);
    const dates = Array.from({ length: 6 }, (_, i) => addDays(startDate, i));
    setWeekDates(dates);
  }, [currentWeek]);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/api/teacher-classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
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
        </Box>
      ));
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
      <ScheduleLayout 
        classes={classes}
        weekDates={weekDates}
        timeSlots={timeSlots}
        renderCellContent={renderCellContent}
      />
    </Dashboard>
  );
}

export default TeacherSchedule;
