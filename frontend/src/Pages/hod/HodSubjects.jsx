import React, { useState, useEffect } from "react";
import api from "../../Auth/api";
import Dashboard from "../../Components/Dashboard/Dashboard";
import { mainItems, reportItems } from '../../Components/Items/HodDrawerItems';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import DragDropUploadButton from "../../Components/Buttons/DragDropUploadButton";

function HodSubjects({ drawerOpen, toggleDrawer }) {
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  useEffect(() => {
    fetchSubjects();
    fetchSemesters();
    fetchSections();
  }, []);

  const fetchSubjects = () => {
    api.get("/api/hod-subjects", {
        params: { semester: selectedSemester, section: selectedSection },
      })
      .then((response) => setSubjects(response.data))
      .catch((error) => console.error("Error fetching subjects:", error));
  };

  const fetchSemesters = () => {
    api
      .get("/api/semesters")
      .then((response) => setSemesters(response.data))
      .catch((error) => console.error("Error fetching semesters:", error));
  };

  const fetchSections = () => {
    api
      .get("/api/sections")
      .then((response) => setSections(response.data))
      .catch((error) => console.error("Error fetching sections:", error));
  };

  return (
    <Dashboard
      title="HOD Dashboard > Subjects"
      mainItems={mainItems}
      reportItems={reportItems}
      headerColor="#00008B"
      drawerOpen={drawerOpen}
      toggleDrawer={toggleDrawer}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 300,
              }}
            >
               <DragDropUploadButton buttonText="Upload Subjects" endpoint="/api/upload-subjects" bgcolor="#00008B"></DragDropUploadButton>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 300,
              }}
            >
              <DragDropUploadButton buttonText="Upload Schedule" endpoint="/api/upload-schedule" bgcolor="#00008B"></DragDropUploadButton>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                      {semesters.map((semester) => (
                        <MenuItem key={semester} value={semester}>
                          {semester}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Section</InputLabel>
                    <Select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                    >
                      {sections.map((section) => (
                        <MenuItem key={section} value={section}>
                          {section}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TableContainer>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>Subject Code</TableCell>
                        <TableCell>Subject Name</TableCell>
                        <TableCell>Teacher</TableCell>
                        <TableCell>Day</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {subjects.map((subject) => (
                        <TableRow key={subject.subject_id}>
                        <TableCell>{subject.subject_code}</TableCell>
                        <TableCell>{subject.subject_name}</TableCell>
                        <TableCell>{subject.teacher_name}</TableCell>
                        <TableCell>{subject.day_of_week}</TableCell>
                        <TableCell>{subject.start_time}</TableCell>
                        <TableCell>{subject.end_time}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Dashboard>
  );
}

export default HodSubjects;
