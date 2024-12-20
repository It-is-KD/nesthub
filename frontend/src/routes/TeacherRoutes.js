import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
    TeacherAttendance,
    TeacherDashboard,
    TeacherForum,
    TeacherProfile,
    TeacherReports,
    TeacherSchedule,
    TeacherSettings,
  } from '../Pages/teacher';

const TeacherRoutes = ({ drawerOpen, toggleDrawer }) => (
  <Routes>
    <Route path="dashboard" element={<TeacherDashboard drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="attendance" element={<TeacherAttendance drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="schedule" element={<TeacherSchedule drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="reports" element={<TeacherReports drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="forum" element={<TeacherForum drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="profile" element={<TeacherProfile drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="settings" element={<TeacherSettings drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
  </Routes>
);

export default TeacherRoutes;