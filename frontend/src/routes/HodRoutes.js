import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
    HodAttendance,
    HodDashboard,
    HodForum,
    HodProfile,
    HodReports,
    HodSchedule,
    HodSettings,
    HodStudents,
    HodTeachers,
    HodSubjects,
  } from '../Pages/hod';

const HodRoutes = ({ drawerOpen, toggleDrawer }) => (
  <Routes>
    <Route path="dashboard" element={<HodDashboard drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="teachers" element={<HodTeachers drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="students" element={<HodStudents drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="subjects" element={<HodSubjects drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="schedule" element={<HodSchedule drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="attendance" element={<HodAttendance drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="reports" element={<HodReports drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="forum" element={<HodForum drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="profile" element={<HodProfile drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="settings" element={<HodSettings drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
  </Routes>
);

export default HodRoutes;