import * as React from 'react';
import { useState } from 'react';
import api from '../../Auth/api';
import { useNavigate } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Navbar from '../../Components/Navbars/Navbar';
import { Alert, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © Made by '}
      <Link color="inherit" href="https://khush-portfolio.netlify.app/" target="_blank" style={{ display: 'inline-flex', alignItems: 'center'}}>
        Khush Desai
        <Avatar
          src="./../imgs/ICO-1.png"
          alt="logo"
          sx={{
            marginLeft: 1,
            width: 20,
            height: 20,
            verticalAlign: 'middle',
          }}
        ></Avatar>
      </Link>
    </Typography>
  );
}

const defaultTheme = createTheme();

function Login() {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

    const handleLogin = async (e) => {
      e.preventDefault();
      if (!isValidEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }
      try {
        const response = await api.post('/login', { email, password });
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          const { role } = response.data.user;
          switch (role) {
            case 'Admin':
              navigate('/admin/dashboard');
              break;
            case 'Student':
              navigate('/student/dashboard');
              break;
            case 'Teacher':
              navigate('/teacher/dashboard');
              break;
            case 'HOD':
              navigate('/hod/dashboard');
              break;
            default:
              setError('Invalid user role');
          }
        } else {
          setError('Invalid credentials');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      }
    };

    const isValidEmail = (email) => {
      return /\S+@\S+\.\S+/.test(email);
    };
  
                
    return (
      <>
        <Navbar />
        <ThemeProvider theme={defaultTheme}>
        <Grid container component="main" sx={{ height: '100vh' }}>
          <CssBaseline />
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage: 'url("../imgs/nsec-signin-img.jpg")',
              backgroundRepeat: 'no-repeat',
              backgroundColor: (t) =>
                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 4,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'white', width: 100, height: 100 }} src="../imgs/nsec_logo.png" ></Avatar>
              <Typography component="h1" variant="h5">
                Log in
              </Typography>
              <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3, mb: 2 }} fullWidth>
                  Signin
                </Button>
                {error && <Alert severity="error" sx={{ marginBottom: 1 }} >{error}</Alert>}
                <Copyright sx={{ mt: 5 }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </ThemeProvider>
      </>
      
    );
  }

export default Login