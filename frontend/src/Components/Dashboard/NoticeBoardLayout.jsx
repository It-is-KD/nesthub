import React, { useState, useEffect, useRef } from 'react';
import api from '../../Auth/api';
import { 
  Box, 
  TextField, 
  List, 
  ListItem, 
  Typography, 
  Paper, 
  Grid, 
  IconButton, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';

function NoticeBoardLayout({ userType, recipientType }) {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    targetRole: '',
    file: null
  });
  const [userId, setUserId] = useState('');
  const fileInputRef = useRef(null);
  const noticesEndRef = useRef(null);

  useEffect(() => {
    fetchUserInfo();
    fetchNotices();
  }, [userType, recipientType]);

  const scrollToBottom = () => {
    noticesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserInfo = async () => {
    try {
      const response = await api.get('/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserId(response.data.user.user_id);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await api.get('/api/notices', {
        params: {
          userType: userType,
          recipientType: recipientType
        }
      });
      setNotices(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
      setNewNotice({ ...newNotice, file: selectedFile });
    } else {
      alert('File size should not exceed 5MB');
    }
  };

  const handleSendNotice = async () => {
    if ((newNotice.content.trim() !== '' || newNotice.file) && newNotice.title && newNotice.targetRole) {
      const formData = new FormData();
      formData.append('sender_id', userId);
      formData.append('title', newNotice.title);
      formData.append('content', newNotice.content);
      formData.append('target_role', newNotice.targetRole);
      if (newNotice.file) {
        formData.append('file', newNotice.file);
      }

      try {
        await api.post('/api/notices', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        setNewNotice({ title: '', content: '', targetRole: '', file: null });
        fetchNotices();
      } catch (error) {
        console.error('Error sending notice:', error);
      }
    }
  };

  const canCreateNotice = ['Admin', 'HOD'].includes(userType);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {userType.charAt(0).toUpperCase() + userType.slice(1)} Notice Board
      </Typography>

      <Paper elevation={3} sx={{ flexGrow: 1, mb: 2, overflow: 'auto', p: 2 }}>
        <List>
          {notices.map((notice, index) => (
            <ListItem key={index}>
              <Card sx={{ width: '100%', mb: 1 }}>
                <CardContent>
                  <Typography variant="h6">
                    {notice.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Posted by {notice.sender_name} {notice.department_name && `- ${notice.department_name}`}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {notice.content}
                  </Typography>
                  {notice.file_content && (
                    <Box sx={{ mt: 1 }}>
                      <a href={`data:${notice.content_type};base64,${notice.file_content}`} 
                         download={notice.file_name}>
                        {notice.file_name}
                      </a>
                    </Box>
                  )}
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {new Date(notice.created_at).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </ListItem>
          ))}
          <div ref={noticesEndRef} />
        </List>
      </Paper>

      {canCreateNotice && (
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Notice Title"
              value={newNotice.title}
              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Notice Content"
              value={newNotice.content}
              onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Target Audience</InputLabel>
              <Select
                value={newNotice.targetRole}
                onChange={(e) => setNewNotice({ ...newNotice, targetRole: e.target.value })}
              >
                <MenuItem value="All">All Users</MenuItem>
                <MenuItem value="Student">All Students</MenuItem>
                <MenuItem value="Teacher">All Teachers</MenuItem>
                {userType === 'Admin' && <MenuItem value="HOD">All HODs</MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <IconButton onClick={() => fileInputRef.current.click()}>
              <AttachFileIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton color="primary" onClick={handleSendNotice}>
              <SendIcon />
            </IconButton>
          </Grid>
        </Grid>
      )}
      {newNotice.file && (
        <Typography variant="caption">
          {newNotice.file.name}
        </Typography>
      )}
    </Box>
  );
}

export default NoticeBoardLayout;