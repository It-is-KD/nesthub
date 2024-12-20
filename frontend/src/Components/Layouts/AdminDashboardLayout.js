import * as React from 'react';
import { useEffect, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import api from '../../Auth/api';

export default function AdminDashboardLayout() {
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    api.get('/api/admin-users')
      .then(response => {
        setAdminUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching admin users:', error);
      });
  }, []);

  return (
    <React.Fragment>
      <Typography component="h2" variant="h6" gutterBottom>
        Admin Users
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {adminUsers.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
