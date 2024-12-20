import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';

export const mainItems = [
  { icon: <DashboardIcon />, text: "Dashboard", link: "/teacher/dashboard" },
  { icon: <CalendarMonthIcon />, text: "Schedule", link: "/teacher/schedule" },
  { icon: <PeopleIcon />, text: "Attendance", link: "/teacher/attendance" },
  { icon: <BarChartIcon />, text: "Reports", link: "/teacher/reports" },
];

export const reportItems = [
  { icon: <ForumIcon />, text: "Forum", link: "/teacher/forum" },
  { icon: <AccountCircleIcon />, text: "Profile", link: "/teacher/profile" },
  { icon: <SettingsIcon />, text: "Settings", link: "/teacher/settings" },
];