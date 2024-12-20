import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../../Auth/api';
import { useAlert } from '../../Hooks/AlertContext';

const ExportDataButton = ({ buttonText = "Export Data", endpoint, bgcolor, params = {} }) => {
  const { showAlert } = useAlert();

  const handleExport = () => {
    api.get(endpoint, { 
      responseType: 'blob',
      params: params
    })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'exported_data.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        showAlert('Data exported successfully!', 'success');
      })
      .catch(error => {
        showAlert(`Error exporting data: ${error}`, 'error');
      });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        borderRadius: 2,
        padding: 3,
        border: '2px dashed #ccc',
        textAlign: 'center',
        cursor: 'pointer'
      }}
      >
      <Button
        variant="contained"
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        fullWidth
        sx={{ marginBottom: 2 }}
        style={{ backgroundColor: bgcolor }}
      >
        {buttonText}
      </Button>
      <Typography variant="body2" color="textSecondary">
        Click to Export
      </Typography>
    </Box>
  );
};

export default ExportDataButton;