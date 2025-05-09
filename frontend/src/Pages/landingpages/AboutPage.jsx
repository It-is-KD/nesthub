import React from "react";
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Navbar from "../../Components/Navbars/Navbar";
import { Box, CssBaseline, Container, Grid, Card, CardContent, CardMedia, Paper, Grow, Collapse, IconButton } from '@mui/material';
import { School, Schedule, Assignment, Group, Forum, Assessment } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function Copyright(props) {
    return (
      <Typography variant="body2" color="text.secondary" align="center" {...props}>
        {'Copyright © Made by '}
        <Link color="inherit" href="https://khush-portfolio.netlify.app/" target="_blank" style={{ display: 'inline-flex', alignItems: 'center'}}>
          Khush Desai
          <Avatar src="./../imgs/ICO-1.png" alt="logo" sx={{ ml: 1, width: 20, height: 20 }}/>
        </Link>
      </Typography>
    );
}

const features = [
    {
        title: "Academic Management",
        description: "Comprehensive system for managing departments, courses, and academic schedules",
        expandedDetails: "Manage multiple departments, course allocations, and semester schedules. Track subject assignments, faculty workload, and department-wise academic planning. Seamlessly coordinate between different academic units.",
        icon: <School fontSize="large"/>,
        image: "../imgs/academic.jpg"
    },
    {
        title: "Attendance Tracking",
        description: "Real-time attendance monitoring and reporting system",
        expandedDetails: "Take attendance digitally, generate automated reports, track attendance patterns, and send notifications for low attendance. View detailed statistics and export attendance data for analysis.",
        icon: <Schedule fontSize="large"/>,
        image: "../imgs/attendance.jpg"
    },
    {
        title: "3rd Party Integration",
        description: "Seamless integration with any third-party system",
        expandedDetails: "Any third-party system can be easily integrated as a separate module withing the platform. This allows existing or new management systems such as library management, examination systems, etc. to be easily implemented and used within one platform.",
        icon: <Assignment fontSize="large"/>,
        image: "../imgs/assignment.jpg"
    },
    {
        title: "User Roles",
        description: "Dedicated portals for Students, Teachers, HODs, and Administrators",
        expandedDetails: "Role-based access control with specific permissions and features for each user type. Secure login system, profile management, and customized dashboards for different roles.",
        icon: <Group fontSize="large"/>,
        image: "../imgs/users.jpg"
    },
    {
        title: "Communication Hub",
        description: "Interactive forums and messaging system for seamless communication",
        expandedDetails: "Department-wise discussion forums, direct messaging, file sharing capabilities, and announcement system. Keep everyone connected and informed with real-time updates.",
        icon: <Forum fontSize="large"/>,
        image: "../imgs/communication.jpg"
    },
    {
        title: "Performance Analytics",
        description: "Detailed analytics and reporting for academic performance",
        expandedDetails: "Generate comprehensive performance reports, track academic progress, analyze trends, and create visual representations of data. Export reports in multiple formats.",
        icon: <Assessment fontSize="large"/>,
        image: "../imgs/analytics.jpg"
    }
];

function FeatureCard({ feature }) {
    const [expanded, setExpanded] = useState(false);
    const [elevation, setElevation] = useState(1);

    return (
        <Card 
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'scale(1.02)',
                    cursor: 'pointer'
                }
            }}
            elevation={elevation}
            onMouseEnter={() => setElevation(8)}
            onMouseLeave={() => setElevation(1)}
        >
            <CardMedia
                component="img"
                height="140"
                image={feature.image}
                alt={feature.title}
            />
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                {feature.icon}
                <Typography gutterBottom variant="h5" component="h3" sx={{ mt: 2 }}>
                    {feature.title}
                </Typography>
                <Typography>
                    {feature.description}
                </Typography>
                <IconButton 
                    onClick={() => setExpanded(!expanded)}
                    sx={{ 
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                    }}
                >
                    <ExpandMoreIcon />
                </IconButton>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Typography paragraph sx={{ textAlign: 'left', px: 2, pb: 2 }}>
                        {feature.expandedDetails}
                    </Typography>
                </Collapse>
            </CardContent>
        </Card>
    );
}

const defaultTheme = createTheme();

function AboutPage(){
    return(
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <Navbar />
            <Box component="main">
                {/* Hero Section */}
                <Paper 
                    sx={{
                        position: 'relative',
                        backgroundColor: 'grey.800',
                        color: '#fff',
                        mb: 4,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundImage: `url(../imgs/nesthub_bg.png)`,
                        height: '400px'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            right: 0,
                            left: 0,
                            backgroundColor: 'rgba(0,0,0,.6)',
                        }}
                    />
                    <Container maxWidth="lg" sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h2" component="h1" gutterBottom>
                            Welcome to Nesthub
                        </Typography>
                        <Typography variant="h5">
                            Your Complete Academic Management Solution
                        </Typography>
                    </Container>
                </Paper>

                {/* Features Section */}
                <Container maxWidth="lg" sx={{ py: 6 }}>
                    <Typography variant="h3" component="h2" align="center" gutterBottom>
                        Our Features
                    </Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Grow in={true} timeout={1000 * (index + 1)}>
                                    <Box>
                                        <FeatureCard feature={feature} />
                                    </Box>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
                <Copyright sx={{ py: 6 }} />
            </Box>
        </ThemeProvider>
    );
}

export default AboutPage