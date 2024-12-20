import React from 'react';
import { NavLink } from "react-router-dom";
import { Menu, MenuItem, IconButton, AppBar, Toolbar, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function NavbarMobile ({ title, mainItems, reportItems, headerColor, children }) {

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: headerColor }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {mainItems.map((item, index) => (
          <MenuItem key={index} onClick={handleClose} component={NavLink} to={item.link}>
            {item.text}
          </MenuItem>
        ))}
        {reportItems.map((item, index) => (
          <MenuItem key={index} onClick={handleClose} component={NavLink} to={item.link}>
              {item.text}
          </MenuItem>
        ))}
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </>
  );
}

export default NavbarMobile;
