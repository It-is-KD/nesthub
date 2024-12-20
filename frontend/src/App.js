//NESTHUB (Netaji Subhash Student Teacher Hub)

import "./App.css";
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login, AboutPage, ContactPage } from './Pages/landingpages';
import { AdminRoutes, HodRoutes, TeacherRoutes, StudentRoutes } from "./routes";
import ProtectedRoute from "./Auth/ProtectedRoute";
import { AlertProvider } from './Hooks/AlertContext';

function App() {
  
  const [drawerOpen, setDrawerOpen] = useState(true);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const routeComponents = {
    Admin: AdminRoutes,
    HOD: HodRoutes,
    Teacher: TeacherRoutes,
    Student: StudentRoutes
  };

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {['Admin', 'HOD', 'Teacher', 'Student'].map((role) => (
          <Route
            key={role}
            path={`/${role.toLowerCase()}/*`}
            element={
              <AlertProvider>
                <ProtectedRoute allowedRoles={[role]}>
                  {React.createElement(routeComponents[role], { drawerOpen, toggleDrawer })}
                </ProtectedRoute>
              </AlertProvider>
            }
          />
        ))}
      </Routes>
    </BrowserRouter>
    
  );
}

export default App;