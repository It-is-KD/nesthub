import React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { NavLink } from "react-router-dom";

const ListItems = ({ items, subheader }) => {
  return (
    <>
      {subheader && (
        <ListSubheader component="div" inset>
          {subheader}
        </ListSubheader>
      )}
      {items.map((item, index) => (
        <ListItemButton
          key={index}
          component={item.link ? NavLink : 'div'}
          to={item.link}
        >
          {item.icon && (
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
          )}
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
    </>
  );
};

export default ListItems;