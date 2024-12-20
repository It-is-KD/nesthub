import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
    StudentDashboard,
    StudentForum,
    StudentProfile,
    StudentReports,
    StudentSettings
  } from '../Pages/student';

const StudentRoutes = ({ drawerOpen, toggleDrawer }) => (
  <Routes>
    <Route path="dashboard" element={<StudentDashboard drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="reports" element={<StudentReports drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="forum" element={<StudentForum drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="profile" element={<StudentProfile drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="settings" element={<StudentSettings drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
  </Routes>
);

export default StudentRoutes;