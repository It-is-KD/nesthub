import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ForumIcon from '@mui/icons-material/Forum';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

export const mainItems = [
  { icon: <DashboardIcon />, text: "Dashboard", link: "/student/dashboard" },
  { icon: <AssessmentIcon />, text: "Reports", link: "/student/reports" },
];

export const reportItems = [
  { icon: <ForumIcon />, text: "Forum", link: "/student/forum" },
  { icon: <ForumIcon />, text: "Notice Board", link: "/student/noticeboard" },
  { icon: <PersonIcon />, text: "Profile", link: "/student/profile" },
  { icon: <SettingsIcon />, text: "Settings", link: "/student/settings" },
];