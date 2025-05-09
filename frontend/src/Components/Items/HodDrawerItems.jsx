import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Person2Icon from '@mui/icons-material/Person2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export const mainItems = [
  { icon: <DashboardIcon />, text: "Dashboard", link: "/hod/dashboard" },
  { icon: <Person2Icon />, text: "Teachers", link: "/hod/teachers" },
  { icon: <PeopleAltIcon />, text: "Students", link: "/hod/students" },
  { icon: <BarChartIcon />, text: "Subjects", link: "/hod/subjects" },
  { icon: <CalendarMonthIcon />, text: "Schedule", link: "/hod/schedule" },
  { icon: <PeopleIcon />, text: "Attendance", link: "/hod/attendance" },
  { icon: <BarChartIcon />, text: "Reports", link: "/hod/reports" },
];

export const reportItems = [
  { icon: <ForumIcon />, text: "Forum", link: "/hod/forum" },
  { icon: <ForumIcon />, text: "Notice Board", link: "/hod/noticeboard" },
  { icon: <AccountCircleIcon />, text: "Profile", link: "/hod/profile" },
  { icon: <SettingsIcon />, text: "Settings", link: "/hod/settings" },
];