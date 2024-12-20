import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
    AdminDashboard,
    AdminTeachers,
    AdminStudents,
    AdminDepartments,
    AdminHod,
    AdminRegister,
    AdminProfile,
    AdminSettings
  } from '../Pages/admin';

const AdminRoutes = ({ drawerOpen, toggleDrawer }) => (
  <Routes>
    <Route path="dashboard" element={<AdminDashboard drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="teachers" element={<AdminTeachers drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="students" element={<AdminStudents drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="departments" element={<AdminDepartments drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="hod" element={<AdminHod drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="register" element={<AdminRegister drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="profile" element={<AdminProfile drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
    <Route path="settings" element={<AdminSettings drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />} />
  </Routes>
);

export default AdminRoutes;