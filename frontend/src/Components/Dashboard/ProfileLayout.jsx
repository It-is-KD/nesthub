import React, { useState, useEffect } from 'react';
import api from '../../Auth/api';
import { Box, Typography, CircularProgress, Grid, Container, Paper, Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function ProfileLayout() {
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data.user);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography color="error">{error}</Typography>
    </Box>
  );

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    try {
      const response = await api.post('/api/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        alert('Password changed successfully');
        handleCloseDialog();
      } else {
        setPasswordError(response.data.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('An error occurred. Please try again.');
    }
  };


  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center">User Profile</Typography>
        {profile && (
          <Paper elevation={3}>
            <Box p={3}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Box display="flex" justifyContent="center">
                    <Avatar sx={{ width: 100, height: 100 }} src='../imgs/nesthub_logo.png'>
                      <PersonIcon fontSize="large" />
                    </Avatar>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" gutterBottom>{profile.name}</Typography>
                  <Typography variant="subtitle1" color="textSecondary" gutterBottom>{profile.role}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box my={2}>
                    <Typography variant="body1"><strong>Email:</strong> {profile.email}</Typography>
                  </Box>
                  <Box my={2}>
                    <Typography variant="body1"><strong>Phone:</strong> {profile.phone}</Typography>
                  </Box>
                  <Box my={2}>
                    <Typography variant="body1"><strong>User ID:</strong> {profile.user_id}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        )}
      </Box>
      <Box my={2}>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Change Password
        </Button>
      </Box>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <form onSubmit={handleChangePassword}>
            <TextField
              label="Old Password"
              type="password"
              fullWidth
              margin="normal"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordError && <Typography color="error">{passwordError}</Typography>}
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Change Password
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>


    </Container>
  );
}

export default ProfileLayout;