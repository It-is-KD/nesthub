import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Person2Icon from '@mui/icons-material/Person2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

export const mainItems = [
  { icon: <DashboardIcon />, text: "Dashboard", link: "/admin/Dashboard" },
  { icon: <AccountBalanceIcon />, text: "Departments", link: "/admin/departments" },
  { icon: <ManageAccountsIcon />, text: "HOD", link: "/admin/hod" },
  { icon: <Person2Icon />, text: "Teachers", link: "/admin/teachers" },
  { icon: <PeopleAltIcon />, text: "Students", link: "/admin/students" },
];

export const reportItems = [
  { icon: <HowToRegIcon />, text: "Register", link: "/admin/register" },
  { icon: <AccountCircleIcon />, text: "Profile", link: "/admin/profile" },
  { icon: <SettingsIcon />, text: "Settings", link: "/admin/settings" },
];