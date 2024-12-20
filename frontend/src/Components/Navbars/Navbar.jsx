import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Avatar, ListItemIcon } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


function Navbar () {
    
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
    const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const navItems = [
      { text: 'About', path: '/about' },
      { text: 'Contact', path: '/contact' },
    ];
  
    return (
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {navItems.map((item) => (
                  <MenuItem key={item.text} onClick={handleClose} component={NavLink} to={item.path}>
                    {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                    <ListItemText primary={item.text} />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} style={{ display: 'inline-flex', alignItems: 'center'}} >
            <Avatar alt="nesthub logo" src="./../imgs/nesthub_logo.png"  sx={{ marginRight: 2, width: 40, height: 40 }} />
            <NavLink to="/" style={{ color: 'rgba(0, 0, 0, 0.87)', textDecoration: 'none' }}>NestHub</NavLink>
          </Typography>
          {!isMobile && navItems.map((item) => (
            <Button color="inherit" key={item.text} startIcon={item.icon}>
              <NavLink to={item.path} style={{ color: 'rgba(0, 0, 0, 0.87)', textDecoration: 'none' }}>
                {item.text}
              </NavLink>
            </Button>
          ))}
        </Toolbar>
      </AppBar>
    );
  };
  

export default Navbar;