import * as React from 'react';
import api from '../../Auth/api';
import Dashboard from '../../Components/Dashboard/Dashboard';
import { mainItems, reportItems } from '../../Components/Items/AdminDrawerItems';
import { Paper, Select, MenuItem, Avatar, Button, TextField, Grid, Box, Typography, Container } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme();

function AdminRegister({ drawerOpen, toggleDrawer }) {

    const handleSubmit = (event) => {
        event.preventDefault();

        const data = new FormData(event.currentTarget);
        
        console.log({
            name: data.get('name'),
            email: data.get('email'),
            password: data.get('password'),
            phone: data.get('phone')
        });

        api.post('/api/register', {
            name: data.get('name'),
            email: data.get('email'),
            password: data.get('password'),
            phone: data.get('phone'),
            role : data.get('role'),
        })
        .then(res => {
            console.log("Data Registered Successfully");
        })
        .catch(err => console.error("Error in registering data", err));
    };

    return (
        <Dashboard
            title="Admin Dashboard > Register"
            mainItems={mainItems}
            reportItems={reportItems}
            headerColor="#000000"
            drawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
        >
        <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
        <Paper
            sx={{
              p: 2,
              display: 'flex',
              marginTop: 4,
            }}>

            <Box
            sx={{
                marginTop: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
            <Avatar sx={{ m: 1, bgcolor: 'brown', width: 60, height: 60 }}></Avatar>
            <Typography component="h1" variant="h5">
                Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                    autoComplete="given-name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    autoFocus
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Select
                        required
                        fullWidth
                        id="role"
                        name="role"
                        label="Role"
                        defaultValue="Student"
                    >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="HOD">HOD</MenuItem>
                        <MenuItem value="Teacher">Teacher</MenuItem>
                        <MenuItem value="Student">Student</MenuItem>
                    </Select>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    required
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    autoComplete="phone"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    />
                </Grid>
                </Grid>
                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Sign Up
                </Button>
            </Box>
            </Box>
            </Paper>            
        </Container>
        </ThemeProvider>

        </Dashboard>        
    );
}

export default AdminRegister