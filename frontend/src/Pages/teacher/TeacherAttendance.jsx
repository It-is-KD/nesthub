import React, { useState, useEffect } from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import AttendanceLayout from '../../Components/Layouts/AttendanceLayout';
import { Container, Box, Slider, Button } from '@mui/material';
import { addDays, startOfWeek } from 'date-fns';
import api from '../../Auth/api';
import { mainItems, reportItems } from '../../Components/Items/TeacherDrawerItems';

function TeacherAttendance({ drawerOpen, toggleDrawer }) {
  
  const [classes, setClasses] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    batches: [],
    semesters: [],
    sections: [],
  });
  const [filters, setFilters] = useState({
    department: '',
    batch: '',
    semester: '',
    section: '',
    day: '',
    time: '',
  });
  const [currentWeek, setCurrentWeek] = useState(0);
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    fetchTeacherClasses();
    updateWeekDates();
  }, [currentWeek]);

  const updateWeekDates = () => {
    const startDate = addDays(startOfWeek(new Date()), currentWeek * 7 + 1); // Start from Monday
    const dates = Array.from({ length: 6 }, (_, i) => addDays(startDate, i));
    setWeekDates(dates);
  };

  const fetchTeacherClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/api/teacher-classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(response.data);
      setFilterOptions({
        departments: [...new Set(response.data.map(c => c.department_name))],
        batches: [...new Set(response.data.map(c => c.batch_name))],
        semesters: [...new Set(response.data.map(c => c.semester))],
        sections: [...new Set(response.data.map(c => c.section_name))],
      });
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
    }
  };
  

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleWeekChange = (event, newValue) => {
    setCurrentWeek(newValue);
  };

  const filteredClasses = classes.filter(c => 
    (!filters.department || c.department_name === filters.department) &&
    (!filters.batch || c.batch_name === filters.batch) &&
    (!filters.semester || c.semester === filters.semester) &&
    (!filters.section || c.section_name === filters.section) &&
    (!filters.day || c.day_of_week === filters.day) &&
    (!filters.time || (c.start_time <= filters.time && c.end_time >= filters.time))
  );
  
  return (
    <Dashboard
      title="Teacher Dashboard > Attendance"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#a52a2a"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Container maxWidth="lg">
        <Box my={4}>
          <Box mb={4} display="flex" alignItems="center" justifyContent="center">
            <Button onClick={() => setCurrentWeek(prev => prev - 1)}>Previous Week</Button>
            <Slider
              value={currentWeek}
              onChange={handleWeekChange}
              step={1}
              marks
              min={-4}
              max={4}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `Week ${value > 0 ? '+' : ''}${value}`}
              sx={{ mx: 2, width: 300 }}
            />
            <Button onClick={() => setCurrentWeek(prev => prev + 1)}>Next Week</Button>
          </Box>
          <AttendanceLayout 
            classes={filteredClasses} 
            filterOptions={filterOptions} 
            filters={filters} 
            handleFilterChange={handleFilterChange}
            weekDates={weekDates}
            currentWeek={currentWeek}
            setCurrentWeek={setCurrentWeek}
          />
        </Box>
      </Container>
    </Dashboard>
  );
}

export default TeacherAttendance;