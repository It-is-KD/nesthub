import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import api from '../../Auth/api';
import { Box, TextField, List, ListItem, ListItemText, Typography, Paper, Grid, IconButton, Avatar, Badge } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import SearchableDropdown from '../Buttons/SearchableDropdown';

const socket = io('http://172.16.50.12:8081', {
  transports: ['websocket', 'polling']
});

// const socket = io('http://localhost:8081', {
//   transports: ['websocket', 'polling']
// });

function ForumLayout({ userType, recipientType }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [file, setFile] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUserInfo();

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom();
    });

    return () => {
      socket.off('newMessage');
    };
  }, [userType, recipientType]);

  useEffect(() => {
    if (userId && selectedRecipient) {
      fetchMessages();
    }
  }, [userId, selectedRecipient]);

  useEffect(() => {
    if (userId) {
      fetchUnreadCounts();
      fetchRecipients();
    }
  }, [userId, unreadCounts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const fetchRecipients = async () => {
    try {
      let endpoint = recipientType === 'student' ? '/api/teacher-students' : '/api/teacher-list';
      const response = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const recipientsWithUnread = response.data.map(recipient => ({
        ...recipient,
        unreadCount: unreadCounts[recipient.user_id] || 0
      }));
      setRecipients(recipientsWithUnread);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const response = await api.get(`/api/unread-counts/${userId}`, {
        params: { recipientType },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUnreadCounts(response.data);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };
  

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/api/messages/${userId}/${selectedRecipient}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessages(response.data);
      scrollToBottom();
      
      // Mark messages as read
      await api.post('/api/mark-messages-read', {
        senderId: selectedRecipient,
        receiverId: userId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUnreadCounts();
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size <= 5 * 1024 * 1024) {
      setFile(selectedFile);
    } else {
      alert('File size should not exceed 5MB');
    }
  };

  const handleSendMessage = async () => {
    if ((newMessage.trim() !== '' || file) && selectedRecipient) {
      const formData = new FormData();
      formData.append('sender_id', userId);
      formData.append('receiver_id', selectedRecipient);
      formData.append('message_content', newMessage);
      formData.append('content_type', file ? file.type : 'text');
      if (file) {
        formData.append('file', file);
      }

      try {
        await api.post('/api/send-message', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        });
        setNewMessage('');
        setFile(null);
        fetchMessages();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleRecipientChange = (newValue) => {
    setSelectedRecipient(newValue ? newValue.user_id : '');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {userType.charAt(0).toUpperCase() + userType.slice(1)} Forum
      </Typography>
      <SearchableDropdown
        options={recipients}
        label="Select the Recipient"
        value={recipients.find(r => r.user_id === selectedRecipient) || null}
        onChange={handleRecipientChange}
        getOptionLabel={(option) => option ? `${option.name} (${option.user_id})` : ''}
        renderOption={(props, option) => (
          <li {...props}>
            <Badge badgeContent={option.unreadCount} color="primary">
              <Avatar sx={{ mr: 2 }}>{option.name[0]}</Avatar>
            </Badge>
            <ListItemText primary={option.name} secondary={option.user_id} />
          </li>
        )}
      />      <Paper elevation={3} sx={{ flexGrow: 1, mb: 2, overflow: 'auto', p: 2, mt: 2 }}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ flexDirection: message.sender_id === userId ? 'row-reverse' : 'row' }}>
              <Paper elevation={1} sx={{ p: 1, maxWidth: '70%', backgroundColor: message.sender_id === userId ? 'primary.light' : 'grey.100' }}>
                <Typography variant="body2" color="text.primary">
                  {message.content_type === 'text' ? (
                    message.message_content
                  ) : (
                    <a href={`data:${message.content_type};base64,${message.message_content}`} download={message.file_name}>
                      {message.file_name}
                    </a>
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {new Date(message.timestamp).toLocaleString()}
                </Typography>
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      <Grid container spacing={1} alignItems="center">
        <Grid item xs>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
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
          <IconButton color="primary" onClick={handleSendMessage}>
            <SendIcon />
          </IconButton>
        </Grid>
      </Grid>
      {file && <Typography variant="caption">{file.name}</Typography>}
    </Box>
  );
}

export default ForumLayout;