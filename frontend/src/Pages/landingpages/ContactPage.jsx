import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Grid, Card, CardContent, Avatar, Link, Divider, IconButton, Snackbar, Alert, CssBaseline } from '@mui/material';
import { GitHub, LinkedIn, Language, Email } from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Navbar from "../../Components/Navbars/Navbar";

const theme = createTheme();

const contactInfo = {
    name: "Khush Desai",
    email: "khush.desai.kol@gmail.com",
    portfolio: "https://khush-portfolio.netlify.app/",
    github: "https://github.com/It-is-KD",
    linkedin: "https://www.linkedin.com/in/khush-desai"
};

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendEmail();
    };

    const sendEmail = () => {
        if (!window.Email) {
            alert("Email library not loaded");
            return;
          }
      
        window.Email.send({
            SecureToken: "725e4af3-3fbf-4fbc-9f8b-e4f947babbf1",
            To: 'itskd.spare@gmail.com',
            From: 'itskd.spare@gmail.com',
            Subject: "FormSubmission: " + formData.subject,
            Body: "Name: " + formData.name + "<br>" + "Email: " + formData.email + "<br><br>" + formData.message
        }).then(
            message => {
                setSnackbar({
                    open: true,
                    message: 'Message Sent Successfully 🫠',
                    severity: 'success'
                });
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        );
    };
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Navbar />
            <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
                <Grid container spacing={4}>
                    {/* Contact Information Card */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={3} sx={{ height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Avatar
                                    src="../imgs/ICO-1.png"
                                    alt={contactInfo.name}
                                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                                />
                                <Typography variant="h5" gutterBottom>
                                    {contactInfo.name}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    Full Stack Developer
                                </Typography>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Email sx={{ mr: 1 }} />
                                    <Typography component={Link} target="_blank" href="mailto:khush.desai.kol@gmail.com">{contactInfo.email}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Language sx={{ mr: 1 }} />
                                    <Typography component={Link} target="_blank" href={contactInfo.portfolio}>{contactInfo.portfolio}</Typography>
                                </Box>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                    <IconButton component={Link} href={contactInfo.github} target="_blank">
                                        <GitHub />
                                    </IconButton>
                                    <IconButton component={Link} href={contactInfo.linkedin} target="_blank">
                                        <LinkedIn />
                                    </IconButton>
                                    <IconButton component={Link} href={contactInfo.portfolio} target="_blank">
                                        <Language />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Contact Form */}
                    <Grid item xs={12} md={8}>
                        <Card elevation={3}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h4" gutterBottom>
                                    Get in Touch
                                </Typography>
                                <Typography color="textSecondary" paragraph>
                                    Have a question or want to work together? Send me a message!
                                </Typography>
                                
                                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="Name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="Subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                required
                                                fullWidth
                                                label="Message"
                                                name="message"
                                                multiline
                                                rows={4}
                                                value={formData.message}
                                                onChange={handleChange}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        endIcon={<SendIcon />}
                                        sx={{ mt: 3 }}
                                    >
                                        Send Message
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </ThemeProvider>
    );
}

export default ContactPage;