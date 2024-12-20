import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../../Auth/api';
import { useAlert } from '../../Hooks/AlertContext';

const DragDropUploadButton = ({ buttonText = "Upload File", endpoint, bgcolor }) => {

  const [dragActive, setDragActive] = useState(false);
  const { showAlert } = useAlert();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      api.post(endpoint, formData)
        .then(response => {
          showAlert('File uploaded successfully', 'success');
        })
        .catch(error => {
          showAlert('Error uploading file: ' + error.message, 'error');
        });
    }
  };

  return (
    <Box
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        borderRadius: 2,
        padding: 3,
        border: dragActive ? '2px dashed #000' : '2px dashed #ccc',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      >
      <label htmlFor="raised-button-file" style={{ width: '100%', textAlign: 'center' }}>
        <input
          accept="*/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleChange}
        />
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          component="span"
          fullWidth
          sx={{ marginBottom: 2 }}
          color="primary"
          style={{ backgroundColor: bgcolor }}
        >
          {buttonText}
        </Button>
      </label>
      <Typography variant="body2" color="textSecondary">
        Drag and drop a file here or click to select
      </Typography>
    </Box>
  );
};

export default DragDropUploadButton;