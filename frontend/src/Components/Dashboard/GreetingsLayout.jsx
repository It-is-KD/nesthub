import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import api from '../../Auth/api';

function Greeting() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return profile && (
    <Typography variant="h4" gutterBottom paddingTop={3} paddingLeft={2}>
      {`${getGreeting()}! ${profile.name}`}
    </Typography>
  );
}

export default Greeting;
