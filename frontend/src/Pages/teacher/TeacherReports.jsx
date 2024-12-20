import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../../Auth/api';
import { mainItems, reportItems } from '../../Components/Items/TeacherDrawerItems';
import ReportsLayout  from '../../Components/Layouts/ReportsLayout';
import { useAlert } from '../../Hooks/AlertContext';

ChartJS.register(ArcElement, Tooltip, Legend);

function TeacherReports({ drawerOpen, toggleDrawer }) {

  const { showAlert } = useAlert();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
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
  });

  const fetchAttendanceData = useCallback(async () => {
    if (!selectedSubject) return;
    try {
      const response = await api.get(`/api/teacher/attendance-summary/${selectedSubject}`);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData({});
    }
  }, [selectedSubject]);

  const fetchLowAttendanceStudents = useCallback(async () => {
    if (!selectedSubject) return;
    try {
      const response = await api.get(`/api/low-attendance-students/${selectedSubject}`);
      if (Array.isArray(response.data)) {
        setLowAttendanceStudents(response.data.map(student => ({
          id: student.student_id,
          name: student.name,
          attendancePercentage: parseFloat(student.attendancePercentage).toFixed(2)
        })));
      } else {
        console.warn('Invalid low attendance students data format received');
        setLowAttendanceStudents([]);
      }
    } catch (error) {
      console.error('Error fetching low attendance students:', error);
      setLowAttendanceStudents([]);
    }
  }, [selectedSubject]);

  useEffect(() => {
    fetchSubjects();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchAttendanceData();
      fetchLowAttendanceStudents();
    }
  }, [selectedSubject, fetchAttendanceData, fetchLowAttendanceStudents]);

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/teacher-schedule');
      if (Array.isArray(response.data) && response.data.length > 0) {
        const uniqueSubjects = [...new Set(response.data.map(item => item.subject_id))];
        setSubjects(uniqueSubjects.map(subjectId => {
          const subject = response.data.find(item => item.subject_id === subjectId);
          return {
            id: subject.subject_id,
            name: subject.subject_name
          };
        }));
        setSelectedSubject(uniqueSubjects[0]);
      } else {
        console.warn('No schedule data returned from API');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };
  
  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/api/teacher-filter-options');
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    fetchFilteredData({ ...filters, [name]: value });
  };
  
  const fetchFilteredData = async (currentFilters) => {
    try {
      const response = await api.get('/api/filtered-attendance', { params: currentFilters });
      setAttendanceData(response.data.attendanceData);
      setLowAttendanceStudents(response.data.lowAttendanceStudents);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };
  

  const sendNotification = async (studentId) => {
    try {
      await api.post('/api/send-attendance-notification', { studentId, subjectId: selectedSubject });
      showAlert('Notification sent successfully', 'success');
    } catch (error) {
      console.error('Error sending notification:', error);
      showAlert('Failed to send notification', 'error');
    }
  };

  const sendNotificationToAll = async (studentIds) => {
    try {
      await api.post('/api/send-attendance-notification-bulk', { studentIds, subjectId: selectedSubject });
      showAlert('Bulk notifications sent successfully', 'success');
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      showAlert('Failed to send bulk notifications', 'error');
    }
  };
  
  return (
    <Dashboard
      title="Teacher Dashboard > Reports"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#a52a2a"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <ReportsLayout
        color="#a52a2a"
        subjects={subjects}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        attendanceData={attendanceData}
        lowAttendanceStudents={lowAttendanceStudents}
        sendNotification={sendNotification}
        sendNotificationToAll={sendNotificationToAll}
        filterOptions={filterOptions}
        filters={filters}
        handleFilterChange={handleFilterChange}
      />
    </Dashboard>
  );
}

export default TeacherReports;