import React, { createContext, useState, useContext } from 'react';
import AlertComponent from '../Components/Buttons/AlertComponent';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  const showAlert = (message, severity = 'success') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertComponent
        open={alertOpen}
        message={alertMessage}
        severity={alertSeverity}
        onClose={handleAlertClose}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);