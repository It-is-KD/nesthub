const PORT = process.env.PORT || 8081;

//...................................................................................................MAIN
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const socketIo = require('socket.io');
const ExcelJS = require('exceljs');
const cron = require('node-cron');
const mysqldump = require('mysqldump');

const cors = require('cors'); //Cross-Origin Resource Sharing
const app = express();

const http = require('http');
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    // origin: "http://172.16.50.12:8081",
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// const port = process.env.PORT || 3001;

//..................................................................................................CONST

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
// const { Console } = require('console');
const upload = multer({ dest: 'uploads/' });

const JWT_SECRET = process.env.JWT_SECRET_KEY;

//....................................................................................................USE

app.use(cors());
app.use(express.json());

//..............................................................................................FUNCTIONS

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: '',
  database: process.env.DB_DATABASE
})

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text
  };

  return transporter.sendMail(mailOptions);
}

function executeQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function generateExcelFile(data, columns, worksheetName) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(worksheetName);
  
  worksheet.columns = columns;
  worksheet.addRows(data);
  
  return workbook;
}

async function sendExcelFile(res, workbook, filename) {
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  res.end();
}

//....................................................................................................GET

app.get('/', (req, res)=>{
  return res.json("Yo! from backend");
})

app.get('/usermaster', authenticateToken, (req, res)=>{
    const sql = "SELECT * FROM usermaster";
    db.query(sql, (err, data)=>{
        if (err) return res.json(err);
        return res.json(data);
    })
})

app.get('/profile', authenticateToken, (req, res) => {
  const sql = "SELECT user_id, name, email, phone, role FROM usermaster WHERE user_id = ?";
  db.query(sql, [req.user.userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });
    if (result.length > 0) {
      return res.json({ success: true, user: result[0] });
    }
    return res.status(404).json({ success: false, message: "User not found" });
  });
});

app.get('/api/section-students/:sectionId', authenticateToken, (req, res) => {
  const sql = `
      SELECT u.user_id as student_id, u.name
      FROM usermaster u
      JOIN studentmaster sm ON u.user_id = sm.student_id
      WHERE sm.section_id = ?
  `;
  db.query(sql, [req.params.sectionId], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
  });
});

app.get('/api/teacher-classes', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const sql = `
  SELECT 
    cs.schedule_id,
    cs.section_id,
    cs.day_of_week,
    cs.start_time,
    cs.end_time,
    s.subject_name,
    sec.section_name,
    b.batch_name,
    d.department_name,
    ss.semester
  FROM class_schedule cs
  JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
  JOIN subject s ON ss.subject_id = s.subject_id
  JOIN section sec ON cs.section_id = sec.section_id
  JOIN batch b ON sec.batch_id = b.batch_id
  JOIN department d ON b.department_id = d.department_id
  WHERE cs.teacher_id = ?
`;
  db.query(sql, [teacherId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.get('/api/view-attendance/:scheduleId/:date', authenticateToken, (req, res) => {
  const { scheduleId, date } = req.params;
  const sql = `
    SELECT u.user_id, u.name, a.status
    FROM usermaster u
    LEFT JOIN attendance a ON u.user_id = a.student_id AND a.schedule_id = ? AND a.date = ?
    JOIN studentmaster sm ON u.user_id = sm.student_id
    JOIN class_schedule cs ON cs.section_id = sm.section_id
    WHERE cs.schedule_id = ?
  `;

  db.query(sql, [scheduleId, date, scheduleId], (err, result) => {
    if (err) {
      console.error('Error fetching attendance:', err);
      return res.status(500).json({ success: false, message: 'Error fetching attendance' });
    }

    const attendanceData = result.map(row => ({
      student_id: row.user_id,
      name: row.name,
      status: row.status || 'Not Marked'
    }));

    res.json(attendanceData);
  });
});

app.get('/api/admin-users', authenticateToken, (req, res) => {
  const sql = "SELECT user_id, name, email, phone FROM usermaster WHERE role = 'Admin'";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching admin users:', err);
      return res.status(500).json({ success: false, message: 'Error fetching admin users' });
    }
    res.json(result);
  });
});

app.get('/api/departments', authenticateToken, (req, res) => {
  const sql = "SELECT * FROM department";
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ success: false, message: 'Error fetching departments' });
    }
    res.json(result);
  });
});

app.get('/api/department-stats', authenticateToken, (req, res) => {
  const sql = `
    SELECT 
      d.department_id,
      d.department_name,
      COUNT(DISTINCT sm.student_id) as student_count,
      COUNT(DISTINCT tm.teacher_id) as teacher_count
    FROM 
      department d
    LEFT JOIN 
      batch b ON b.department_id = d.department_id
    LEFT JOIN 
      section sec ON sec.batch_id = b.batch_id
    LEFT JOIN 
      studentmaster sm ON sm.section_id = sec.section_id
    LEFT JOIN 
      teachermaster tm ON tm.department_id = d.department_id
    GROUP BY 
      d.department_id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching department stats:', err);
      return res.status(500).json({ success: false, message: 'Error fetching department stats' });
    }
    res.json(result);
  });
});

app.get('/api/teachers', authenticateToken, (req, res) => {
  const sql = `
    SELECT t.teacher_id, u.name, u.email, d.department_name, t.joining_date
    FROM teachermaster t
    JOIN usermaster u ON t.teacher_id = u.user_id
    JOIN department d ON t.department_id = d.department_id
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching teachers:', err);
      return res.status(500).json({ success: false, message: 'Error fetching teachers' });
    }
    res.json(result);
  });
});

app.get('/api/hods', authenticateToken, (req, res) => {
  const sql = `
    SELECT h.hod_id, u.name, u.email, d.department_name, h.appointment_date
    FROM hodmaster h
    JOIN usermaster u ON h.hod_id = u.user_id
    JOIN department d ON h.department_id = d.department_id
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching HODs:', err);
      return res.status(500).json({ success: false, message: 'Error fetching HODs' });
    }
    res.json(result);
  });
});

app.get('/api/students', authenticateToken, (req, res) => {
  const sql = `
    SELECT 
      sm.student_id, 
      u.name, 
      u.email, 
      u.phone, 
      d.department_name, 
      b.batch_name, 
      s.section_name, 
      sm.current_semester, 
      sm.admission_date
    FROM studentmaster sm
    JOIN usermaster u ON sm.student_id = u.user_id
    JOIN section s ON sm.section_id = s.section_id
    JOIN batch b ON s.batch_id = b.batch_id
    JOIN department d ON b.department_id = d.department_id
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ success: false, message: 'Error fetching students' });
    }
    res.json(result);
  });
});

app.get('/api/student-stats', authenticateToken, (req, res) => {
  const sql = `
    SELECT 
      d.department_name, 
      COUNT(sm.student_id) as student_count
    FROM department d
    LEFT JOIN batch b ON d.department_id = b.department_id
    LEFT JOIN section s ON b.batch_id = s.batch_id
    LEFT JOIN studentmaster sm ON s.section_id = sm.section_id
    GROUP BY d.department_id
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching student stats:', err);
      return res.status(500).json({ success: false, message: 'Error fetching student stats' });
    }
    const stats = result.reduce((acc, row) => {
      acc[row.department_name] = row.student_count;
      return acc;
    }, {});
    res.json(stats);
  });
});

app.get('/api/hod-teachers', authenticateToken, (req, res) => {
  const hodId = req.user.userId;
  const sql = `
    SELECT t.teacher_id, u.name, u.email, u.phone, t.joining_date
    FROM teachermaster t
    JOIN usermaster u ON t.teacher_id = u.user_id
    JOIN hodmaster h ON t.department_id = h.department_id
    WHERE h.hod_id = ?
  `;
  db.query(sql, [hodId], (err, result) => {
    if (err) {
      console.error('Error fetching HOD teachers:', err);
      return res.status(500).json({ success: false, message: 'Error fetching teachers' });
    }
    res.json(result);
  });
});

app.get('/api/hod-students', authenticateToken, (req, res) => {
  const hodId = req.user.userId;
  const { batch, semester, section } = req.query;
  
  let sql = `
    SELECT 
      sm.student_id, 
      u.name, 
      u.email, 
      u.phone, 
      b.batch_name, 
      s.section_name, 
      sm.current_semester, 
      sm.admission_date
    FROM studentmaster sm
    JOIN usermaster u ON sm.student_id = u.user_id
    JOIN section s ON sm.section_id = s.section_id
    JOIN batch b ON s.batch_id = b.batch_id
    JOIN department d ON b.department_id = d.department_id
    JOIN hodmaster h ON d.department_id = h.department_id
    WHERE h.hod_id = ?
  `;

  const params = [hodId];

  if (batch) {
    sql += " AND b.batch_name = ?";
    params.push(batch);
  }

  if (semester) {
    sql += " AND sm.current_semester = ?";
    params.push(semester);
  }

  if (section) {
    sql += " AND s.section_name = ?";
    params.push(section);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error fetching HOD students:', err);
      return res.status(500).json({ success: false, message: 'Error fetching students' });
    }
    res.json(result);
  });
});

app.get('/api/hod-subjects', authenticateToken, (req, res) => {
  const hodId = req.user.userId;
  const { semester, section } = req.query;
  
  let sql = `
    SELECT s.subject_id, s.subject_name, s.subject_code, 
           u.name AS teacher_name, 
           cs.day_of_week, cs.start_time, cs.end_time
    FROM subject s
    JOIN semester_subject ss ON s.subject_id = ss.subject_id
    JOIN department d ON ss.department_id = d.department_id
    JOIN hodmaster h ON d.department_id = h.department_id
    LEFT JOIN class_schedule cs ON ss.semester_subject_id = cs.semester_subject_id
    LEFT JOIN teachermaster t ON cs.teacher_id = t.teacher_id
    LEFT JOIN usermaster u ON t.teacher_id = u.user_id
    WHERE h.hod_id = ?
  `;

  const params = [hodId];

  if (semester) {
    sql += " AND ss.semester = ?";
    params.push(semester);
  }

  if (section) {
    sql += " AND cs.section_id = ?";
    params.push(section);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error fetching HOD subjects:', err);
      return res.status(500).json({ success: false, message: 'Error fetching subjects' });
    }
    res.json(result);
  });
});

app.get('/api/semesters', authenticateToken, (req, res) => {
  const hodId = req.user.userId;
  const sql = `
    SELECT DISTINCT ss.semester
    FROM semester_subject ss
    JOIN department d ON ss.department_id = d.department_id
    JOIN hodmaster h ON d.department_id = h.department_id
    WHERE h.hod_id = ?
    ORDER BY ss.semester
  `;
  db.query(sql, [hodId], (err, result) => {
    if (err) {
      console.error('Error fetching semesters:', err);
      return res.status(500).json({ success: false, message: 'Error fetching semesters' });
    }
    res.json(result.map(row => row.semester));
  });
});

app.get('/api/sections', authenticateToken, (req, res) => {
  const hodId = req.user.userId;
  const sql = `
    SELECT DISTINCT s.section_id, s.section_name
    FROM section s
    JOIN batch b ON s.batch_id = b.batch_id
    JOIN department d ON b.department_id = d.department_id
    JOIN hodmaster h ON d.department_id = h.department_id
    WHERE h.hod_id = ?
    ORDER BY s.section_name
  `;
  db.query(sql, [hodId], (err, result) => {
    if (err) {
      console.error('Error fetching sections:', err);
      return res.status(500).json({ success: false, message: 'Error fetching sections' });
    }
    res.json(result.map(row => row.section_name));
  });
});

app.get('/api/messages/:senderId/:receiverId', authenticateToken, (req, res) => {
  const { senderId, receiverId } = req.params;
  const sql = `
    SELECT fm.*, 
           CASE 
             WHEN fm.sender_id = ? THEN u_receiver.name 
             ELSE u_sender.name 
           END AS sender_name
    FROM forum_messages fm
    JOIN usermaster u_sender ON fm.sender_id = u_sender.user_id
    JOIN usermaster u_receiver ON fm.receiver_id = u_receiver.user_id
    WHERE (fm.sender_id = ? AND fm.receiver_id = ?) OR (fm.sender_id = ? AND fm.receiver_id = ?)
    ORDER BY fm.timestamp ASC
  `;
  db.query(sql, [senderId, senderId, receiverId, receiverId, senderId], (err, result) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
    res.json(result.map(message => ({
      ...message,
      message_content: message.content_type === 'text'
        ? message.message_content?.toString() || ''
        : message.message_content ? message.message_content.toString('base64') : null,
      content_url: message.content_type !== 'text'
        ? `data:${message.content_type};base64,${message.message_content?.toString('base64')}`
        : null
    })));
    
  });
});

app.get('/api/teacher-students', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const sql = `
    SELECT DISTINCT u.user_id, u.name
    FROM usermaster u
    JOIN studentmaster sm ON u.user_id = sm.student_id
    JOIN section s ON sm.section_id = s.section_id
    JOIN class_schedule cs ON s.section_id = cs.section_id
    WHERE cs.teacher_id = ?
  `;
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).json({ success: false, message: 'Error fetching students' });
    }
    res.json(result);
  });
});
 
app.get('/api/teacher-list', authenticateToken, (req, res) => {
  const sql = `
    SELECT user_id, name
    FROM usermaster
    WHERE role = 'Teacher'
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching teachers:', err);
      return res.status(500).json({ success: false, message: 'Error fetching teachers' });
    }
    res.json(result);
  });
});

app.get('/api/teacher/schedule', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const sql = `
    SELECT 
      cs.day_of_week, 
      cs.start_time, 
      cs.end_time, 
      s.subject_name, 
      sec.section_name
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject s ON ss.subject_id = s.subject_id
    JOIN section sec ON cs.section_id = sec.section_id
    WHERE cs.teacher_id = ?
    ORDER BY 
      CASE
        WHEN cs.day_of_week = 'Monday' THEN 1
        WHEN cs.day_of_week = 'Tuesday' THEN 2
        WHEN cs.day_of_week = 'Wednesday' THEN 3
        WHEN cs.day_of_week = 'Thursday' THEN 4
        WHEN cs.day_of_week = 'Friday' THEN 5
        WHEN cs.day_of_week = 'Saturday' THEN 6
      END,
      cs.start_time
  `;
  
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error('Error fetching teacher schedule:', err);
      return res.status(500).json({ success: false, message: 'Error fetching schedule' });
    }
    res.json(result);
  });
});

app.get('/api/teacher/attendance-summary', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const sql = `
    SELECT 
      s.subject_name,
      COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN a.student_id END) as attending_count,
      COUNT(DISTINCT sm.student_id) as total_count
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject s ON ss.subject_id = s.subject_id
    JOIN section sec ON cs.section_id = sec.section_id
    JOIN studentmaster sm ON sm.section_id = sec.section_id
    LEFT JOIN attendance a ON cs.schedule_id = a.schedule_id AND a.student_id = sm.student_id
    WHERE cs.teacher_id = ?
    GROUP BY s.subject_id
  `;

  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error('Error fetching attendance summary:', err);
      return res.status(500).json({ success: false, message: 'Error fetching attendance summary' });
    }

    const attendanceSummary = result.reduce((acc, row) => {
      acc[row.subject_name] = {
        attending: row.attending_count,
        total: row.total_count
      };
      return acc;
    }, {});

    res.json(attendanceSummary);
  });
});

app.get('/api/teacher-subjects', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const sql = `
    SELECT DISTINCT s.subject_id, s.subject_name
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject s ON ss.subject_id = s.subject_id
    WHERE cs.teacher_id = ?
  `;
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error('Error fetching teacher subjects:', err);
      return res.status(500).json({ success: false, message: 'Error fetching subjects', error: err.message });
    }
    res.json(result);
  });
});

app.get('/api/teacher-schedule', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const sql = `
    SELECT DISTINCT cs.schedule_id, s.subject_id, s.subject_name, sec.section_name
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject s ON ss.subject_id = s.subject_id
    JOIN section sec ON cs.section_id = sec.section_id
    WHERE cs.teacher_id = ?
  `;
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error('Error fetching teacher schedule:', err);
      return res.status(500).json({ success: false, message: 'Error fetching schedule' });
    }
    res.json(result);
  });
});

app.get('/api/schedule-dropdown-data', authenticateToken, (req, res) => {
  const sql = `
    SELECT DISTINCT
      d.department_id, d.department_name,
      b.batch_id, b.batch_name,
      ss.semester,
      sec.section_name,
      s.subject_id, s.subject_code, s.subject_name
    FROM department d
    JOIN batch b ON d.department_id = b.department_id
    JOIN section sec ON b.batch_id = sec.batch_id
    JOIN semester_subject ss ON d.department_id = ss.department_id
    JOIN subject s ON ss.subject_id = s.subject_id
  `;
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching schedule dropdown data:', err);
      return res.status(500).json({ success: false, message: 'Error fetching schedule dropdown data' });
    }
    
    const dropdownData = {
      departments: [],
      batches: [],
      semesters: [],
      sections: [],
      subjects: []
    };
    
    result.forEach(row => {
      if (!dropdownData.departments.find(d => d.department_id === row.department_id)) {
        dropdownData.departments.push({ department_id: row.department_id, department_name: row.department_name });
      }
      if (!dropdownData.batches.find(b => b.batch_id === row.batch_id)) {
        dropdownData.batches.push({ batch_id: row.batch_id, batch_name: row.batch_name });
      }
      if (!dropdownData.semesters.includes(row.semester)) {
        dropdownData.semesters.push(row.semester);
      }
      if (!dropdownData.sections.includes(row.section_name)) {
        dropdownData.sections.push(row.section_name);
      }
      if (!dropdownData.subjects.find(s => s.subject_id === row.subject_id)) {
        dropdownData.subjects.push({ subject_id: row.subject_id, subject_code: row.subject_code, subject_name: row.subject_name });
      }
    });
    res.json(dropdownData);
  });
});

app.get('/api/teacher/attendance-summary/:subjectId', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const { subjectId } = req.params;
  const sql = `
    SELECT 
      s.subject_name,
      COUNT(DISTINCT CASE WHEN a.status = 'Present' THEN a.student_id END) as attending_count,
      COUNT(DISTINCT sm.student_id) as total_count
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject s ON ss.subject_id = s.subject_id
    JOIN section sec ON cs.section_id = sec.section_id
    JOIN studentmaster sm ON sm.section_id = sec.section_id
    LEFT JOIN attendance a ON cs.schedule_id = a.schedule_id AND a.student_id = sm.student_id
    WHERE cs.teacher_id = ? AND s.subject_id = ?
    GROUP BY s.subject_id
  `;

  db.query(sql, [teacherId, subjectId], (err, result) => {
    if (err) {
      console.error('Error fetching attendance summary:', err);
      return res.status(500).json({ success: false, message: 'Error fetching attendance summary' });
    }

    if (result.length > 0) {
      const { attending_count, total_count } = result[0];
      const aboveThreshold = attending_count;
      const belowThreshold = total_count - attending_count;
      res.json({ aboveThreshold, belowThreshold });
    } else {
      res.json({ aboveThreshold: 0, belowThreshold: 0 });
    }
  });
});

app.get('/api/low-attendance-students/:subjectId', authenticateToken, (req, res) => {
  const { subjectId } = req.params;
  const sql = `
    SELECT 
      sm.student_id,
      u.name,
      (COUNT(CASE WHEN a.status = 'Present' THEN 1 END) / COUNT(*)) * 100 as attendancePercentage
    FROM studentmaster sm
    JOIN usermaster u ON sm.student_id = u.user_id
    JOIN class_schedule cs ON sm.section_id = cs.section_id
    LEFT JOIN attendance a ON cs.schedule_id = a.schedule_id AND sm.student_id = a.student_id
    WHERE cs.semester_subject_id = (SELECT semester_subject_id FROM semester_subject WHERE subject_id = ?)
    GROUP BY sm.student_id
    HAVING attendancePercentage < 75
    ORDER BY attendancePercentage ASC
  `;
  db.query(sql, [subjectId], (err, result) => {
    if (err) {
      console.error('Error fetching low attendance students:', err);
      return res.status(500).json({ success: false, message: 'Error fetching student data' });
    }
    res.json(result);
  });
});

app.get('/api/student/:userId/subjects', authenticateToken, (req, res) => {
  const studentId = req.params.userId;
  const sql = `
    SELECT DISTINCT 
      s.subject_name, 
      cs.day_of_week, 
      cs.start_time
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject s ON ss.subject_id = s.subject_id
    JOIN section sec ON cs.section_id = sec.section_id
    JOIN studentmaster sm ON sm.section_id = sec.section_id
    WHERE sm.student_id = ?
    ORDER BY 
      CASE
        WHEN cs.day_of_week = 'Monday' THEN 1
        WHEN cs.day_of_week = 'Tuesday' THEN 2
        WHEN cs.day_of_week = 'Wednesday' THEN 3
        WHEN cs.day_of_week = 'Thursday' THEN 4
        WHEN cs.day_of_week = 'Friday' THEN 5
        WHEN cs.day_of_week = 'Saturday' THEN 6
      END,
      cs.start_time
  `;
  
  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error('Error fetching student subjects:', err);
      return res.status(500).json({ success: false, message: 'Error fetching subjects' });
    }
    res.json(result);
  });
});

app.get('/api/student/:studentId/attendance', authenticateToken, async (req, res) => {
  const { studentId } = req.params;

    const sql = `
      SELECT 
        s.subject_name,
        s.subject_code,
        COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_count,
        COUNT(a.status) as total_classes,
        (COUNT(CASE WHEN a.status = 'Present' THEN 1 END) / COUNT(a.status)) * 100 as attendance_percentage
      FROM 
        studentmaster sm
      JOIN 
        class_schedule cs ON sm.section_id = cs.section_id
      JOIN 
        semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
      JOIN 
        subject s ON ss.subject_id = s.subject_id
      LEFT JOIN 
        attendance a ON cs.schedule_id = a.schedule_id AND a.student_id = sm.student_id
      WHERE 
        sm.student_id = ?
      GROUP BY 
        s.subject_id
    `;

    db.query(sql, [studentId], (err, result) => {
      if (err) {
        console.error('Error fetching details:', err);
        return res.status(500).json({ success: false, message: 'Error fetching details' });
      }
      res.json(result);
    });
});

app.get('/api/teacher-subjects', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const sql = `
    SELECT DISTINCT s.subject_id, s.subject_name
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject s ON ss.subject_id = s.subject_id
    WHERE cs.teacher_id = ?
  `;
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error('Error fetching teacher subjects:', err);
      return res.status(500).json({ success: false, message: 'Error fetching subjects' });
    }
    res.json(result);
  });
});

app.get('/api/teacher-filter-options', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const sql = `
    SELECT DISTINCT 
      d.department_id, d.department_name,
      b.batch_id, b.batch_name,
      ss.semester,
      sec.section_id, sec.section_name
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN section sec ON cs.section_id = sec.section_id
    JOIN batch b ON sec.batch_id = b.batch_id
    JOIN department d ON b.department_id = d.department_id
    WHERE cs.teacher_id = ?
  `;
  db.query(sql, [teacherId], (err, result) => {
    if (err) {
      console.error('Error fetching filter options:', err);
      return res.status(500).json({ success: false, message: 'Error fetching filter options' });
    }
    const filterOptions = {
      departments: [],
      batches: [],
      semesters: [],
      sections: []
    };
    result.forEach(row => {
      if (!filterOptions.departments.find(d => d.id === row.department_id)) {
        filterOptions.departments.push({ id: row.department_id, name: row.department_name });
      }
      if (!filterOptions.batches.find(b => b.id === row.batch_id)) {
        filterOptions.batches.push({ id: row.batch_id, name: row.batch_name });
      }
      if (!filterOptions.semesters.includes(row.semester)) {
        filterOptions.semesters.push(row.semester);
      }
      if (!filterOptions.sections.includes(row.section_name)) {
        filterOptions.sections.push(row.section_name);
      }
    });
    res.json(filterOptions);
  });
});

app.get('/api/filtered-attendance', authenticateToken, (req, res) => {
  const teacherId = req.user.userId;
  const { subjectId, startDate, endDate, department, batch, semester, section } = req.query;
  console.log('Received filter parameters:', { subjectId, startDate, endDate, department, batch, semester, section });
  let sql = `
    SELECT 
      s.student_id, u.name, 
      COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_count,
      COUNT(a.status) as total_classes,
      (COUNT(CASE WHEN a.status = 'Present' THEN 1 END) / COUNT(a.status)) * 100 as attendance_percentage
    FROM studentmaster s
    JOIN usermaster u ON s.student_id = u.user_id
    JOIN section sec ON s.section_id = sec.section_id
    JOIN batch b ON sec.batch_id = b.batch_id
    JOIN department d ON b.department_id = d.department_id
    JOIN class_schedule cs ON sec.section_id = cs.section_id
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    LEFT JOIN attendance a ON cs.schedule_id = a.schedule_id AND s.student_id = a.student_id
    WHERE cs.teacher_id = ? AND ss.subject_id = ?
  `;

  if (startDate && endDate) {
    sql += " AND a.date BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }
  if (department) {
    sql += " AND d.department_id = ?";
    params.push(department);
  }
  if (batch) {
    sql += " AND b.batch_id = ?";
    params.push(batch);
  }
  if (semester) {
    sql += " AND ss.semester = ?";
    params.push(semester);
  }
  if (section) {
    sql += " AND sec.section_name = ?";
    params.push(section);
  }

  sql += " GROUP BY s.student_id";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error fetching filtered attendance:', err);
      return res.status(500).json({ success: false, message: 'Error fetching attendance data' });
    }

    const attendanceData = {
      aboveThreshold: 0,
      belowThreshold: 0
    };

    const lowAttendanceStudents = result.filter(student => {
      if (student.attendance_percentage >= 75) {
        attendanceData.aboveThreshold++;
        return false;
      } else {
        attendanceData.belowThreshold++;
        return true;
      }
    });

    res.json({ attendanceData, lowAttendanceStudents });
  });
});

app.get('/api/semesters', authenticateToken, (req, res) => {
  try {
    const sql = 'SELECT * FROM semester';
    db.query(sql, (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({ message: 'Error fetching semesters' });
  }
});

app.get('/api/department-schedule/:semesterId', authenticateToken, (req, res) => {
  const { semesterId } = req.params;
  const hodId = req.user.userId;
  try {
    const sql = `
      SELECT
        cs.schedule_id,
        cs.section_id,
        cs.day_of_week,
        cs.start_time,
        cs.end_time,
        s.subject_name,
        sec.section_name,
        b.batch_name,
        d.department_id,
        d.department_name,
        ss.semester
      FROM class_schedule cs
      JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
      JOIN subject s ON ss.subject_id = s.subject_id
      JOIN section sec ON cs.section_id = sec.section_id
      JOIN batch b ON sec.batch_id = b.batch_id
      JOIN department d ON b.department_id = d.department_id
      JOIN hodmaster h ON h.hod_id = ?
      WHERE d.department_id = h.department_id AND ss.semester = ?
    `;

    db.query(sql, [hodId, semesterId], (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    });
  } catch (error) {
    console.error('Error fetching department schedule:', error);
    res.status(500).json({ message: 'Error fetching department schedule' });
  }
});

app.get('/api/export-hods', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT h.hod_id, u.name, u.email, u.phone, d.department_name, h.appointment_date
      FROM hodmaster h
      JOIN usermaster u ON h.hod_id = u.user_id
      JOIN department d ON h.department_id = d.department_id
    `;
    
    const results = await executeQuery(sql);
    
    const columns = [
      { header: 'HOD ID', key: 'hod_id', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Department', key: 'department_name', width: 20 },
      { header: 'Appointment Date', key: 'appointment_date', width: 20 }
    ];
    
    const workbook = await generateExcelFile(results, columns, 'HODs');
    await sendExcelFile(res, workbook, 'HODs.xlsx');
  } catch (error) {
    console.error('Error exporting HODs:', error);
    res.status(500).json({ success: false, message: 'Error exporting HODs' });
  }
});

app.get('/api/export-users', authenticateToken, async (req, res) => {

  try{
    const sql = "SELECT user_id, name, email, phone, role FROM usermaster";
    const results = await executeQuery(sql);

    const columns = [
      { header: 'User ID', key: 'user_id', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Role', key: 'role', width: 15 }
    ];

    const workbook = await generateExcelFile(results, columns, 'Users');
    await sendExcelFile(res, workbook, 'Users.xlsx');
  } catch (error){
      console.error('Error exporting users:', error);
      res.status(500).json({ success: false, message: 'Error exporting users' });
  }
});

app.get('/api/export-departments', authenticateToken, async (req, res) => {
  try{
      const sql = "SELECT department_id, department_name FROM department";
      const results = await executeQuery(sql);

      const columns = [
        { header: 'Department ID', key: 'department_id', width: 15 },
        { header: 'Department Name', key: 'department_name', width: 30 }
      ];

      const workbook = await generateExcelFile(results, columns, 'Departments');
      await sendExcelFile(res, workbook, 'Departments.xlsx');
  } catch (error){
          console.error('Error exporting departments:', error);
          res.status(500).json({ success: false, message: 'Error exporting departments' });
    }
});

app.get('/api/export-teachers', authenticateToken, async (req, res) => {
  try{
  const sql = `
    SELECT t.teacher_id, u.name, u.email, u.phone, d.department_name, t.joining_date,
           s.subject_name, ss.semester, b.batch_name, sec.section_name,
           cs.day_of_week, cs.start_time, cs.end_time
    FROM teachermaster t
    JOIN usermaster u ON t.teacher_id = u.user_id
    JOIN department d ON t.department_id = d.department_id
    LEFT JOIN class_schedule cs ON t.teacher_id = cs.teacher_id
    LEFT JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    LEFT JOIN subject s ON ss.subject_id = s.subject_id
    LEFT JOIN section sec ON cs.section_id = sec.section_id
    LEFT JOIN batch b ON sec.batch_id = b.batch_id
    ORDER BY t.teacher_id, cs.day_of_week, cs.start_time
  `;
  const results = await executeQuery(sql);

  const columns = [
    { header: 'Teacher ID', key: 'teacher_id', width: 15 },
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Department', key: 'department_name', width: 20 },
    { header: 'Joining Date', key: 'joining_date', width: 15 },
    { header: 'Subject', key: 'subject_name', width: 20 },
    { header: 'Semester', key: 'semester', width: 10 },
    { header: 'Batch', key: 'batch_name', width: 15 },
    { header: 'Section', key: 'section_name', width: 10 },
    { header: 'Day', key: 'day_of_week', width: 15 },
    { header: 'Start Time', key: 'start_time', width: 15 },
    { header: 'End Time', key: 'end_time', width: 15 }
  ];
  
  const workbook = await generateExcelFile(results, columns, 'Teachers');
  await sendExcelFile(res, workbook, 'Teachers.xlsx');
  } catch (error){
    console.error('Error exporting teachers:', error);
    res.status(500).json({ success: false, message: 'Error exporting teachers' });
  }
});

app.get('/api/export-students', authenticateToken, async (req, res) => {
  try{
    const sql = `
      SELECT sm.student_id, u.name, u.email, u.phone, d.department_name,
            b.batch_name, sec.section_name, sm.admission_date, sm.current_semester
      FROM studentmaster sm
      JOIN usermaster u ON sm.student_id = u.user_id
      JOIN section sec ON sm.section_id = sec.section_id
      JOIN batch b ON sec.batch_id = b.batch_id
      JOIN department d ON b.department_id = d.department_id
      ORDER BY sm.student_id
    `;
    const results = await executeQuery(sql);
    
    const columns = [
      { header: 'Student ID', key: 'student_id', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Department', key: 'department_name', width: 20 },
      { header: 'Batch', key: 'batch_name', width: 15 },
      { header: 'Section', key: 'section_name', width: 10 },
      { header: 'Admission Date', key: 'admission_date', width: 15 },
      { header: 'Current Semester', key: 'current_semester', width: 15 }
    ];

    const workbook = await generateExcelFile(results, columns, 'Students');
    await sendExcelFile(res, workbook, 'Students.xlsx');
  } catch (error){
      console.error('Error exporting students:', error);
      res.status(500).json({ success: false, message: 'Error exporting students' });
    }
});

app.get('/api/export-teachers-hod', authenticateToken, async (req, res) => {
  try{
    const hodId = req.user.userId;
    const sql = `
      SELECT t.teacher_id, u.name, u.email, u.phone, d.department_name, t.joining_date,
            s.subject_name, ss.semester, b.batch_name, sec.section_name,
            cs.day_of_week, cs.start_time, cs.end_time
      FROM teachermaster t
      JOIN usermaster u ON t.teacher_id = u.user_id
      JOIN department d ON t.department_id = d.department_id
      JOIN hodmaster h ON d.department_id = h.department_id
      LEFT JOIN class_schedule cs ON t.teacher_id = cs.teacher_id
      LEFT JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
      LEFT JOIN subject s ON ss.subject_id = s.subject_id
      LEFT JOIN section sec ON cs.section_id = sec.section_id
      LEFT JOIN batch b ON sec.batch_id = b.batch_id
      WHERE h.hod_id = ?
      ORDER BY t.teacher_id, cs.day_of_week, cs.start_time
    `;
    
    const results = await executeQuery(sql, [hodId]);
    const columns = [
      { header: 'Teacher ID', key: 'teacher_id', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Department', key: 'department_name', width: 20 },
      { header: 'Joining Date', key: 'joining_date', width: 15 },
      { header: 'Subject', key: 'subject_name', width: 20 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Batch', key: 'batch_name', width: 15 },
      { header: 'Section', key: 'section_name', width: 10 },
      { header: 'Day', key: 'day_of_week', width: 15 },
      { header: 'Start Time', key: 'start_time', width: 15 },
      { header: 'End Time', key: 'end_time', width: 15 }
    ];

    const workbook = await generateExcelFile(results, columns, 'Teachers');
    await sendExcelFile(res, workbook, 'Teachers.xlsx');
  } catch (error){
      console.error('Error exporting teachers:', error);
      res.status(500).json({ success: false, message: 'Error exporting teachers' });
  }
});

app.get('/api/export-students-hod', authenticateToken, async (req, res) => {
  try{
    const hodId = req.user.userId;
    const sql = `
      SELECT sm.student_id, u.name, u.email, u.phone, d.department_name,
            b.batch_name, sec.section_name, sm.admission_date, sm.current_semester
      FROM studentmaster sm
      JOIN usermaster u ON sm.student_id = u.user_id
      JOIN section sec ON sm.section_id = sec.section_id
      JOIN batch b ON sec.batch_id = b.batch_id
      JOIN department d ON b.department_id = d.department_id
      JOIN hodmaster h ON d.department_id = h.department_id
      WHERE h.hod_id = ?
      ORDER BY sm.student_id
    `;
    
    const results = await executeQuery(sql, [hodId]);

    const columns = [
      { header: 'Student ID', key: 'student_id', width: 15 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Department', key: 'department_name', width: 20 },
      { header: 'Batch', key: 'batch_name', width: 15 },
      { header: 'Section', key: 'section_name', width: 10 },
      { header: 'Admission Date', key: 'admission_date', width: 15 },
      { header: 'Current Semester', key: 'current_semester', width: 15 }
    ];

    const workbook = await generateExcelFile(results, columns, 'Students');
    await sendExcelFile(res, workbook, 'Students.xlsx');
  } catch (error){
      console.error('Error exporting students:', error);
      res.status(500).json({ success: false, message: 'Error exporting students' });
  }
});

app.get('/api/export-filtered-attendance', authenticateToken, async (req, res) => {
  const teacherId = req.user.userId;
  const { subjectId, startDate, endDate, department, batch, semester, section } = req.query;
  console.log('Received request for filtered attendance:', { subjectId, startDate, endDate, department, batch, semester, section });
  let sql = `
    SELECT 
      s.student_id AS Student_ID,
      u.name AS Name,
      d.department_name AS Department,
      b.batch_name AS Batch,
      ss.semester AS Semester,
      sec.section_name AS Section,
      sub.subject_name AS Subject,
      COUNT(CASE WHEN a.status = 'Present' THEN 1 END) AS Classes_Attended,
      COUNT(a.status) AS Total_Classes,
      (COUNT(CASE WHEN a.status = 'Present' THEN 1 END) / COUNT(a.status)) * 100 AS Attendance_Percentage
    FROM studentmaster s
    JOIN usermaster u ON s.student_id = u.user_id
    JOIN section sec ON s.section_id = sec.section_id
    JOIN batch b ON sec.batch_id = b.batch_id
    JOIN department d ON b.department_id = d.department_id
    JOIN class_schedule cs ON sec.section_id = cs.section_id
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject sub ON ss.subject_id = sub.subject_id
    LEFT JOIN attendance a ON cs.schedule_id = a.schedule_id AND s.student_id = a.student_id
    WHERE cs.teacher_id = ? AND ss.subject_id = ?
  `;

  const params = [teacherId, subjectId];

  if (startDate && endDate) {
    sql += " AND a.date BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }
  if (department) {
    sql += " AND d.department_id = ?";
    params.push(department);
  }
  if (batch) {
    sql += " AND b.batch_id = ?";
    params.push(batch);
  }
  if (semester) {
    sql += " AND ss.semester = ?";
    params.push(semester);
  }
  if (section) {
    sql += " AND sec.section_name = ?";
    params.push(section);
  }

  sql += " GROUP BY s.student_id";

  try {
    const results = await executeQuery(sql, params);

    const columns = [
      { header: 'Student ID', key: 'Student_ID', width: 15 },
      { header: 'Name', key: 'Name', width: 20 },
      { header: 'Department', key: 'Department', width: 20 },
      { header: 'Batch', key: 'Batch', width: 15 },
      { header: 'Semester', key: 'Semester', width: 10 },
      { header: 'Section', key: 'Section', width: 10 },
      { header: 'Subject', key: 'Subject', width: 20 },
      { header: 'Classes Attended', key: 'Classes_Attended', width: 15 },
      { header: 'Total Classes', key: 'Total_Classes', width: 15 },
      { header: 'Attendance Percentage', key: 'Attendance_Percentage', width: 20 }
    ];

    const workbook = await generateExcelFile(results, columns, 'Filtered Attendance');
    await sendExcelFile(res, workbook, 'Filtered_Attendance.xlsx');
  } catch (error) {
    console.error('Error exporting filtered attendance:', error);
    res.status(500).json({ success: false, message: 'Error exporting filtered attendance' });
  }
});

app.get('/api/export-attendance', authenticateToken, async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const { subjectId, startDate, endDate, department, batch, semester, section } = req.query;

    let sql = `
      SELECT
        u.user_id AS student_id,
        u.name AS student_name,
        u.email AS student_email,
        d.department_name,
        b.batch_name,
        sm.current_semester,
        s.subject_name,
        cs.day_of_week,
        cs.start_time,
        cs.end_time,
        DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
        a.status
      FROM attendance a
      JOIN class_schedule cs ON a.schedule_id = cs.schedule_id
      JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
      JOIN subject s ON ss.subject_id = s.subject_id
      JOIN usermaster u ON a.student_id = u.user_id
      JOIN studentmaster sm ON u.user_id = sm.student_id
      JOIN section sec ON sm.section_id = sec.section_id
      JOIN batch b ON sec.batch_id = b.batch_id
      JOIN department d ON b.department_id = d.department_id
      WHERE cs.teacher_id = ? AND ss.subject_id = ?
    `;

    const params = [teacherId, subjectId];

    if (startDate && endDate) {
      sql += " AND a.date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }
    if (department) {
      sql += " AND d.department_id = ?";
      params.push(department);
    }
    if (batch) {
      sql += " AND b.batch_id = ?";
      params.push(batch);
    }
    if (semester) {
      sql += " AND sm.current_semester = ?";
      params.push(semester);
    }
    if (section) {
      sql += " AND sec.section_name = ?";
      params.push(section);
    }

    sql += " ORDER BY s.subject_name, a.date, u.name";

    const results = await executeQuery(sql, params);

    const columns = [
      { header: 'Student ID', key: 'student_id', width: 15 },
      { header: 'Student Name', key: 'student_name', width: 20 },
      { header: 'Student Email', key: 'student_email', width: 30 },
      { header: 'Department', key: 'department_name', width: 20 },
      { header: 'Batch', key: 'batch_name', width: 15 },
      { header: 'Semester', key: 'current_semester', width: 10 },
      { header: 'Subject', key: 'subject_name', width: 20 },
      { header: 'Day', key: 'day_of_week', width: 15 },
      { header: 'Start Time', key: 'start_time', width: 15 },
      { header: 'End Time', key: 'end_time', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    const workbook = await generateExcelFile(results, columns, 'Attendance');
    await sendExcelFile(res, workbook, 'Attendance.xlsx');
  } catch (error) {
    console.error('Error exporting attendance:', error);
    res.status(500).json({ success: false, message: 'Error exporting attendance' });
  }
});

app.get('/api/unread-counts/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT sender_id, COUNT(*) as unread_count
    FROM forum_messages
    WHERE receiver_id = ? AND is_read = FALSE
    GROUP BY sender_id
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching unread counts:', err);
      return res.status(500).json({ success: false, message: 'Error fetching unread counts' });
    }
    const unreadCounts = result.reduce((acc, row) => {
      acc[row.sender_id] = row.unread_count;
      return acc;
    }, {});
    res.json(unreadCounts);
  });
});

app.get('/api/messages/:senderId/:receiverId', authenticateToken, (req, res) => {
  const { senderId, receiverId } = req.params;
  const sql = `
    SELECT fm.*, 
           CASE 
             WHEN fm.sender_id = ? THEN u_receiver.name 
             ELSE u_sender.name 
           END AS sender_name,
           fm.is_read
    FROM forum_messages fm
    JOIN usermaster u_sender ON fm.sender_id = u_sender.user_id
    JOIN usermaster u_receiver ON fm.receiver_id = u_receiver.user_id
    WHERE (fm.sender_id = ? AND fm.receiver_id = ?) OR (fm.sender_id = ? AND fm.receiver_id = ?)
    ORDER BY fm.timestamp ASC
  `;
  db.query(sql, [senderId, senderId, receiverId, receiverId, senderId], (err, result) => {
    if (err) {
      console.error('Error fetching messages:', err);
      return res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
    res.json(result);
  });
});

//...................................................................................................POST

app.post('/api/register', async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO usermaster (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";
  const values = [name, email, hashedPassword, phone, role];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error in registration" });
    }
    return res.status(200).json({ message: "User registered successfully", userId: result.insertId });
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM usermaster WHERE email = ?";
  
  db.query(sql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
    if (result.length > 0) {
      const user = result[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ success: true, user: { id: user.user_id, role: user.role }, token });
      }
    }
    console.log(email, password);
    return res.json({ success: false, message: "Invalid credentials" });
  });
});

app.post('/api/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.userId;

  // Fetch the user's current password hash
  const sql = "SELECT password FROM usermaster WHERE user_id = ?";
  db.query(sql, [userId], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Server error" });
    if (result.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    const user = result[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    const updateSql = "UPDATE usermaster SET password = ? WHERE user_id = ?";
    db.query(updateSql, [hashedNewPassword, userId], (updateErr, updateResult) => {
      if (updateErr) return res.status(500).json({ success: false, message: "Error updating password" });
      res.json({ success: true, message: "Password updated successfully" });
    });
  });
});

app.post('/upload-users', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      const lowercaseData = Object.keys(data).reduce((acc, key) => {
        acc[key.toLowerCase()] = data[key];
        return acc;
      }, {});

      if (lowercaseData.user_id && lowercaseData.name && lowercaseData.email && lowercaseData.password && lowercaseData.phone) {
        results.push(lowercaseData);
      } else {
        console.warn('Skipping invalid row:', lowercaseData);
      }
    })
    .on('end', async () => {
      const insertUser = async (user) => {
        const { user_id, name, email, password, phone } = user;
        
        if (!user_id || !name || !email || !password || !phone) {
          throw new Error('Invalid user data');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
        INSERT INTO usermaster (user_id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, 'Admin')
        ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), password = VALUES(password), phone = VALUES(phone)`;
        
        return new Promise((resolve, reject) => {
          db.query(sql, [user_id, name, email, hashedPassword, phone], (err, result) => {
            if (err) {
              console.error('Error inserting user:', err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      };

      const processUsers = async () => {
        let successful = 0;
        let failed = 0;

        for (const user of results) {
          try {
            await insertUser(user);
            successful++;
          } catch (error) {
            failed++;
            console.error('Error inserting user:', error);
          }
        }

        return { successful, failed };
      };

      processUsers()
        .then(({ successful, failed }) => {
          res.json({
            success: true,
            message: `Users uploaded: ${successful} successful, ${failed} failed.`
          });
        })
        .catch(error => {
          console.error('Error during batch insert:', error);
          res.status(500).json({ success: false, message: 'Error processing users' });
        })
        .finally(() => {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });
        });
    });
});

app.post('/api/submit-attendance', authenticateToken, (req, res) => {
  const { scheduleId, date, attendance } = req.body;
  const formattedDate = date;

  const fetchScheduleDataSql = `
    SELECT cs.day_of_week, cs.start_time, cs.end_time, s.subject_name
    FROM class_schedule cs
    JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
    JOIN subject s ON ss.subject_id = s.subject_id
    WHERE cs.schedule_id = ?
  `;

  db.query(fetchScheduleDataSql, [scheduleId], (err, scheduleData) => {
    if (err) {
      console.error('Error fetching schedule data:', err);
      return res.status(500).json({ success: false, message: 'Error fetching schedule data' });
    }

    if (scheduleData.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const { day_of_week, start_time, end_time, subject_name } = scheduleData[0];

    const values = Object.entries(attendance).map(([studentId, status]) => [
      scheduleId,
      studentId,
      formattedDate,
      status,
      subject_name,
      day_of_week,
      start_time,
      end_time
    ]);

    const sql = `
      INSERT INTO attendance 
      (schedule_id, student_id, date, status, subject, day_of_week, start_time, end_time)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
      status = VALUES(status),
      subject = VALUES(subject),
      day_of_week = VALUES(day_of_week),
      start_time = VALUES(start_time),
      end_time = VALUES(end_time)
    `;

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error('Error submitting attendance:', err);
        return res.status(500).json({ success: false, message: 'Error submitting attendance' });
      }

      const now = new Date();
      const notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 30, 0, 0);
      
      if (now > notificationTime) {
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      const delay = notificationTime.getTime() - now.getTime();

      setTimeout(() => {
        db.query(
          `SELECT subject_name, start_time, end_time, batch_name FROM class_schedule cs
            JOIN semester_subject ss ON cs.semester_subject_id = ss.semester_subject_id
            JOIN department d ON ss.department_id = d.department_id
            JOIN batch b ON d.department_id = b.department_id
            JOIN subject s ON ss.subject_id = s.subject_id WHERE cs.schedule_id = ?`,
          [scheduleId],
          (err, classDetails) => {
            if (err) {
              console.error('Error fetching class details:', err);
              return;
            }

            Object.entries(attendance).forEach(([studentId, status]) => {
              if (status === 'Absent') {
                db.query('SELECT email FROM usermaster WHERE user_id = ?', [studentId], (err, students) => {
                  if (err) {
                    console.error('Error fetching student email:', err);
                  } else if (students.length > 0) {
                    sendEmail(
                      students[0].email,
                      'Absence Notification',
                      `You were marked absent for ${classDetails[0].subject_name} class on ${formattedDate} from ${classDetails[0].start_time} to ${classDetails[0].end_time}. Please contact your instructor for more information.`
                    ).catch(error => console.error('Error sending email:', error));
                  }
                });
              }
            });
          }
        );
      }, delay);

      res.json({ success: true, message: 'Attendance submitted successfully. Notifications will be sent at 5:30 PM.' });
    });
  });
});

app.post('/upload-departments', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      if (data.department_id && data.department_name) {
        results.push(data);
      } else {
        console.warn('Skipping invalid row:', data);
      }
    })
    .on('end', () => {
      const insertDepartment = (department) => {
        return new Promise((resolve, reject) => {
          const sql = "INSERT INTO department (department_id, department_name) VALUES (?, ?) ON DUPLICATE KEY UPDATE department_name = VALUES(department_name)";
          db.query(sql, [department.department_id, department.department_name], (err, result) => {
            if (err) {
              console.error('Error inserting department:', err);
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      };

      Promise.all(results.map(insertDepartment))
        .then(() => {
          res.json({
            success: true,
            message: `Departments uploaded: ${results.length} processed.`
          });
        })
        .catch(error => {
          console.error('Error during batch insert:', error);
          res.status(500).json({ success: false, message: 'Error processing departments' });
        })
        .finally(() => {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });
        });
    });
});

app.post('/upload-teachers', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      if (data.user_id && data.name && data.email && data.password && data.phone && data.department_id && data.joining_date) {
        results.push(data);
      } else {
        console.warn('Skipping invalid row:', data);
      }
    })
    .on('end', async () => {
      const insertTeacher = async (teacher) => {
        const hashedPassword = await bcrypt.hash(teacher.password, 10);
        
        return new Promise((resolve, reject) => {
          db.beginTransaction((err) => {
            if (err) { reject(err); return; }
            
            const userSql = "INSERT INTO usermaster (user_id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, 'Teacher')";
            db.query(userSql, [teacher.user_id, teacher.name, teacher.email, hashedPassword, teacher.phone], (err, result) => {
              if (err) {
                return db.rollback(() => {
                  reject(err);
                });
              }
              
              const teacherSql = "INSERT INTO teachermaster (teacher_id, department_id, joining_date) VALUES (?, ?, STR_TO_DATE(?, '%d-%m-%Y'))";
              db.query(teacherSql, [teacher.user_id, teacher.department_id, teacher.joining_date], (err, result) => {
                if (err) {
                  return db.rollback(() => {
                    reject(err);
                  });
                }
                
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      reject(err);
                    });
                  }
                  resolve(result);
                });
              });
            });
          });
        });
      };

      try {
        await Promise.all(results.map(insertTeacher));
        res.json({
          success: true,
          message: `Teachers uploaded: ${results.length} processed.`
        });
      } catch (error) {
        console.error('Error during batch insert:', error);
        res.status(500).json({ success: false, message: 'Error processing teachers' });
      } finally {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      }
    });
});

app.post('/upload-hods', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      const lowercaseData = Object.keys(data).reduce((acc, key) => {
        acc[key.toLowerCase()] = data[key];
        return acc;
      }, {});

      if (lowercaseData.user_id && lowercaseData.name && lowercaseData.email && lowercaseData.password && lowercaseData.phone && lowercaseData.department_id && lowercaseData.appointment_date) {
        results.push(lowercaseData);
      } else {
        console.warn('Skipping invalid row:', lowercaseData);
      }
    })
    .on('end', async () => {
      const insertHod = async (hod) => {
        const { user_id, name, email, password, phone, department_id, appointment_date } = hod;
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userSql = "INSERT INTO usermaster (user_id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, 'HOD')";
        const hodSql = "INSERT INTO hodmaster (hod_id, department_id, appointment_date) VALUES (?, ?, STR_TO_DATE(?, '%d-%m-%Y'))";

        return new Promise((resolve, reject) => {
          db.beginTransaction((err) => {
            if (err) reject(err);

            db.query(userSql, [user_id, name, email, hashedPassword, phone], (err, userResult) => {
              if (err) {
                return db.rollback(() => reject(err));
              }

              db.query(hodSql, [user_id, department_id, appointment_date], (err, hodResult) => {
                if (err) {
                  return db.rollback(() => reject(err));
                }

                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => reject(err));
                  }
                  resolve(hodResult);
                });
              });
            });
          });
        });
      };

      const processHods = async () => {
        let successful = 0;
        let failed = 0;

        for (const hod of results) {
          try {
            await insertHod(hod);
            successful++;
          } catch (error) {
            failed++;
            console.error('Error inserting HOD:', error);
          }
        }

        return { successful, failed };
      };

      processHods()
        .then(({ successful, failed }) => {
          res.json({
            success: true,
            message: `HODs uploaded: ${successful} successful, ${failed} failed.`
          });
        })
        .catch(error => {
          console.error('Error during batch insert:', error);
          res.status(500).json({ success: false, message: 'Error processing HODs' });
        })
        .finally(() => {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });
        });
    });
});

app.post('/upload-students', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      const lowercaseData = Object.keys(data).reduce((acc, key) => {
        acc[key.toLowerCase()] = data[key];
        return acc;
      }, {});

      if (lowercaseData.user_id && lowercaseData.name && lowercaseData.email && lowercaseData.password && lowercaseData.phone && lowercaseData.department_id && lowercaseData.batch_id && lowercaseData.batch_name && lowercaseData.start_year && lowercaseData.end_year && lowercaseData.section_id && lowercaseData.section_name && lowercaseData.admission_date && lowercaseData.current_semester) {
        results.push(lowercaseData);
      } else {
        console.warn('Skipping invalid row:', lowercaseData);
      }
    })
    .on('end', async () => {
      const insertStudent = async (student) => {
        const { user_id, name, email, password, phone, department_id, batch_id, batch_name, start_year, end_year, section_id, section_name, admission_date, current_semester } = student;
        
        const hashedPassword = await bcrypt.hash(password, 10);

        // const userSql = "INSERT INTO usermaster (user_id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, 'Student')";
        // const batchSql = "INSERT INTO batch (batch_id, batch_name, start_year, end_year, department_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE batch_name = VALUES(batch_name), start_year = VALUES(start_year), end_year = VALUES(end_year)";
        // const sectionSql = "INSERT INTO section (section_id, section_name, batch_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE section_name = VALUES(section_name)";
        // const studentSql = "INSERT INTO studentmaster (student_id, section_id, admission_date, current_semester) VALUES (?, ?, STR_TO_DATE(?, '%d-%m-%Y'), ?) ON DUPLICATE KEY UPDATE section_id = VALUES(section_id), admission_date = STR_TO_DATE(VALUES(admission_date), '%d-%m-%Y'), current_semester = VALUES(current_semester)";

        const userSql = "INSERT INTO usermaster (user_id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, 'Student') ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), password = VALUES(password), phone = VALUES(phone)";
        const batchSql = "INSERT INTO batch (batch_id, batch_name, start_year, end_year, department_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE batch_id = VALUES(batch_id), batch_name = VALUES(batch_name), start_year = VALUES(start_year), end_year = VALUES(end_year), department_id = VALUES(department_id)";
        const sectionSql = "INSERT INTO section (section_id, section_name, batch_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE section_id = VALUES(section_id), section_name = VALUES(section_name), batch_id = VALUES(batch_id)";
        const studentSql = `
        INSERT INTO studentmaster (student_id, section_id, admission_date, current_semester) 
        VALUES (?, ?, COALESCE(STR_TO_DATE(?, '%d-%m-%Y'), CURDATE()), ?) 
        ON DUPLICATE KEY UPDATE 
          section_id = VALUES(section_id), 
          admission_date = COALESCE(STR_TO_DATE(VALUES(admission_date), '%d-%m-%Y'), admission_date),
          current_semester = VALUES(current_semester)
      `;



        return new Promise((resolve, reject) => {
          db.beginTransaction((err) => {
            if (err) reject(err);

            db.query(userSql, [user_id, name, email, hashedPassword, phone], (err, userResult) => {
              if (err) {
                return db.rollback(() => reject(err));
              }

              db.query(batchSql, [batch_id, batch_name, start_year, end_year, department_id], (err, batchResult) => {
                if (err) {
                  return db.rollback(() => reject(err));
                }

                db.query(sectionSql, [section_id, section_name, batch_id], (err, sectionResult) => {
                  if (err) {
                    return db.rollback(() => reject(err));
                  }

                  db.query(studentSql, [user_id, section_id, admission_date, current_semester], (err, studentResult) => {
                    if (err) {
                      return db.rollback(() => reject(err));
                    }

                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => reject(err));
                      }
                      resolve(studentResult);
                    });
                  });
                });
              });
            });
          });
        });
      };

      const processStudents = async () => {
        let successful = 0;
        let failed = 0;

        for (const student of results) {
          try {
            await insertStudent(student);
            successful++;
          } catch (error) {
            failed++;
            console.error('Error inserting student:', error);
          }
        }

        return { successful, failed };
      };

      processStudents()
        .then(({ successful, failed }) => {
          res.json({
            success: true,
            message: `Students uploaded: ${successful} successful, ${failed} failed.`
          });
        })
        .catch(error => {
          console.error('Error during batch insert:', error);
          res.status(500).json({ success: false, message: 'Error processing students' });
        })
        .finally(() => {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });
        });
    });
});

app.post('/api/upload-subjects', authenticateToken, upload.single('file'), (req, res) => {
  const hodId = req.user.userId;
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const insertSubject = (subject) => {
        return new Promise((resolve, reject) => {
          db.beginTransaction((err) => {
            if (err) reject(err);

            const subjectSql = "INSERT INTO subject (subject_id, subject_name, subject_code) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE subject_name = VALUES(subject_name)";
            db.query(subjectSql, [subject.subject_id, subject.subject_name, subject.subject_code], (err, result) => {
              if (err) return db.rollback(() => reject(err));

              const semesterSubjectSql = "INSERT INTO semester_subject (semester_subject_id, department_id, semester, subject_id) VALUES (?, ?, ?, ?)";
              db.query(semesterSubjectSql, [subject.semester_subject_id, subject.department_id, subject.semester, subject.subject_id], (err, result) => {
                if (err) return db.rollback(() => reject(err));

                db.commit((err) => {
                  if (err) return db.rollback(() => reject(err));
                  resolve(result);
                });
              });
            });
          });
        });
      };

      Promise.all(results.map(insertSubject))
        .then(() => {
          res.json({ success: true, message: `Subjects uploaded: ${results.length} processed.` });
        })
        .catch(error => {
          console.error('Error during batch insert:', error);
          res.status(500).json({ success: false, message: 'Error processing subjects' });
        })
        .finally(() => {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });
        });
    });
});

app.post('/api/upload-schedule', authenticateToken, upload.single('file'), (req, res) => {
  const hodId = req.user.userId;
  const results = [];
  const timeSlots = ['10:00:00', '11:00:00', '12:00:00', '13:00:00', '13:30:00', '14:30:00', '15:30:00', '16:30:00', '17:30:00'];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      const lowercaseData = Object.keys(data).reduce((acc, key) => {
        acc[key.toLowerCase()] = data[key];
        return acc;
      }, {});

      if (lowercaseData.schedule_id && lowercaseData.section_id && lowercaseData.semester_subject_id && 
          lowercaseData.teacher_id && lowercaseData.day_of_week && lowercaseData.start_time && lowercaseData.end_time) {
        results.push(lowercaseData);
      } else {
        console.warn('Skipping invalid row:', lowercaseData);
      }
    })
    .on('end', () => {
      const insertSchedule = (schedule) => {
        return new Promise((resolve, reject) => {
          const startIndex = timeSlots.indexOf(schedule.start_time);
          const endIndex = timeSlots.indexOf(schedule.end_time);

          if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
            console.warn('Skipping schedule with invalid time slot:', schedule);
            resolve(); // Resolve without inserting
            return;
          }

          const sql = `
          INSERT INTO class_schedule (schedule_id, section_id, semester_subject_id, teacher_id, day_of_week, start_time, end_time) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            section_id = VALUES(section_id),
            semester_subject_id = VALUES(semester_subject_id),
            teacher_id = VALUES(teacher_id),
            day_of_week = VALUES(day_of_week),
            start_time = VALUES(start_time),
            end_time = VALUES(end_time)
          `;
          db.query(sql, [schedule.schedule_id, schedule.section_id, schedule.semester_subject_id, schedule.teacher_id, schedule.day_of_week, schedule.start_time, schedule.end_time], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      };

      Promise.all(results.map(insertSchedule))
        .then((results) => {
          const successfulInserts = results.filter(Boolean).length;
          res.json({
            success: true,
            message: `Schedules processed: ${results.length} total, ${successfulInserts} successful, ${results.length - successfulInserts} skipped.`
          });
        })
        .catch(error => {
          console.error('Error during batch insert:', error);
          res.status(500).json({ success: false, message: 'Error processing schedules' });
        })
        .finally(() => {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temporary file:', err);
          });
        });
    });
});

// app.post('/api/update-schedule', authenticateToken, (req, res) => {
//   const userId = req.user.userId;
//   const { scheduleUpdates } = req.body;
//   console.log('Received request body:', req.body);

//   if (!Array.isArray(scheduleUpdates) || scheduleUpdates.length === 0) {
//     return res.status(400).json({ success: false, message: 'Invalid or empty scheduleUpdates array' });
//   }

//   const update = scheduleUpdates[0]; // Process the first update in the array
//   const { day_of_week, timeSlot, department_id, batch_name, semester, section, subject_code } = update;

//   const fetchSectionId = `
//     SELECT section_id 
//     FROM section 
//     WHERE batch_id = (SELECT batch_id FROM batch WHERE batch_name = ? AND department_id = ?)
//     AND section_name = ?
//   `;
//   const fetchSemesterSubjectId = `
//     SELECT ss.semester_subject_id
//     FROM semester_subject ss
//     JOIN subject s ON ss.subject_id = s.subject_id
//     WHERE ss.department_id = ? AND ss.semester = ? AND s.subject_code = ?
//   `;

//   Promise.all([
//     new Promise((resolve, reject) => {
//       db.query(fetchSectionId, [batch_name, department_id, section], (err, result) => {
//         if (err) reject(err);
//         else if (result.length === 0) reject(new Error(`No section found for batch ${batch_name}, department ${department_id}, section ${section}`));
//         else resolve(result);
//       });
//     }),
//     new Promise((resolve, reject) => {
//       db.query(fetchSemesterSubjectId, [department_id, semester, subject_code], (err, result) => {
//         if (err) reject(err);
//         else if (result.length === 0) reject(new Error(`No semester subject found for department ${department_id}, semester ${semester}, subject code ${subject_code}`));
//         else resolve(result);
//       });
//     })
//   ])
//     .then(([sectionResult, semesterSubjectResult]) => {
//       const sectionId = sectionResult[0].section_id;
//       const semesterSubjectId = semesterSubjectResult[0].semester_subject_id;

//       const updateSql = `
//         UPDATE class_schedule cs
//         SET
//           cs.section_id = ?,
//           cs.semester_subject_id = ?
//         WHERE cs.day_of_week = ? AND cs.start_time = ? AND cs.teacher_id = ?
//       `;
//       const updateValues = [sectionId, semesterSubjectId, day_of_week, timeSlot, userId];
//       console.log('Update values:', updateValues);

//       db.query(updateSql, updateValues, (err, result) => {
//         if (err) {
//           console.error('Error updating schedule:', err);
//           res.status(500).json({ success: false, message: 'Error updating schedule', error: err.message });
//         } else {
//           if (result.affectedRows === 0) {
//             res.status(404).json({ success: false, message: 'No matching schedule found to update' });
//           } else {
//             res.json({ success: true, message: 'Schedule updated successfully' });
//           }
//         }
//       });
//     })
//     .catch(error => {
//       console.error('Error processing schedule update:', error);
//       res.status(500).json({ success: false, message: 'Error processing schedule update', error: error.message });
//     });
// });

app.post('/api/send-message', upload.single('file'), (req, res) => {
  const { sender_id, receiver_id, content_type, message_content, file_name } = req.body;
  let messageData = message_content;

  if (req.file) {
    const filePath = req.file.path;

    // Read the image file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error reading file' });
      }

      // Set messageData to the image data
      messageData = data;

      // Insert the message into the database
      const sql = "INSERT INTO forum_messages (sender_id, receiver_id, message_content, content_type, file_name) VALUES (?, ?, ?, ?, ?)";
      db.query(sql, [sender_id, receiver_id, messageData, content_type, req.file.originalname], (err, result) => {
        // Delete the temporary file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting temporary file:', err);
          }
        });

        if (err) {
          console.error('Error saving message:', err);
          return res.status(500).json({ success: false, message: 'Error saving message' });
        }
        res.json({ success: true, message: 'Message sent successfully', messageId: result.insertId });
      });
    });
  } else {
    // If no image is uploaded, insert the message with text content
    const sql = "INSERT INTO forum_messages (sender_id, receiver_id, message_content, content_type, file_name) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [sender_id, receiver_id, messageData, content_type, file_name], (err, result) => {
      if (err) {
        console.error('Error saving message:', err);
        return res.status(500).json({ success: false, message: 'Error saving message' });
      }
      res.json({ success: true, message: 'Message sent successfully', messageId: result.insertId });
    });
  }
});

app.post('/api/send-attendance-notification', authenticateToken, (req, res) => {
  const { studentId, subjectId } = req.body;
  const sql = `
    SELECT u.email, s.subject_name
    FROM usermaster u
    CROSS JOIN subject s 
    WHERE u.user_id = ? AND s.subject_id = ?
  `;

  db.query(sql, [studentId, subjectId], (err, result) => {
    if (err) {
      console.error('Error fetching data for notification:', err);
      return res.status(500).json({ success: false, message: 'Error preparing notification' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Student or subject not found' });
    }

    const { email, subject_name } = result[0];

    sendEmail(
      email,
      'Low Attendance Notification',
      `Your attendance in ${subject_name} is below 75%. Please improve your attendance.`
    ).then(() => {
      res.json({ success: true, message: 'Notification sent successfully' });
    }).catch(error => {
      console.error('Error sending email:', error);
      res.status(500).json({ success: false, message: 'Error sending notification' });
    });
  });
});

app.post('/api/send-attendance-notification-bulk', authenticateToken, (req, res) => {
  const { studentIds, subjectId } = req.body;
  const sql = `
    SELECT u.email, s.subject_name
    FROM usermaster u
    CROSS JOIN subject s 
    WHERE u.user_id IN (?) AND s.subject_id = ?
  `;

  db.query(sql, [studentIds, subjectId], (err, result) => {
    if (err) {
      console.error('Error fetching data for bulk notification:', err);
      return res.status(500).json({ success: false, message: 'Error preparing bulk notification' });
    }

    const emailPromises = result.map(({ email, subject_name }) => 
      sendEmail(
        email,
        'Low Attendance Notification',
        `Your attendance in ${subject_name} is below 75%. Please improve your attendance.`
      )
    );

    Promise.all(emailPromises)
      .then(() => {
        res.json({ success: true, message: 'Bulk notifications sent successfully' });
      })
      .catch(error => {
        console.error('Error sending bulk emails:', error);
        res.status(500).json({ success: false, message: 'Error sending bulk notifications' });
      });
  });
});

app.post('/api/mark-messages-read', authenticateToken, (req, res) => {
  const { senderId, receiverId } = req.body;
  const sql = `
    UPDATE forum_messages
    SET is_read = TRUE
    WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
  `;
  db.query(sql, [senderId, receiverId], (err, result) => {
    if (err) {
      console.error('Error marking messages as read:', err);
      return res.status(500).json({ success: false, message: 'Error marking messages as read' });
    }
    res.json({ success: true, message: 'Messages marked as read' });
  });
});

//.................................................................................................SOCKET

io.on('connection', (socket) => {

  socket.on('sendMessage', (data) => {
    const { sender_id, receiver_id, message_text } = data;
    console.log('Received message:', data);
    const sql = "INSERT INTO forum_messages (sender_id, receiver_id, message_text) VALUES (?, ?, ?)";
    db.query(sql, [sender_id, receiver_id, message_text], (err, result) => {
      if (err) {
        console.error('Error saving message:', err);
      } else {
        io.emit('newMessage', { ...data, message_id: result.insertId, timestamp: new Date() });
      }
    });
  });

});

//.................................................................................................BACKUP
cron.schedule('30 17 * * *', () => {
  const folderPath = path.join(__dirname, 'backend');
  const backupFileName = path.join(folderPath, 'nesthub_backup.sql');

  mysqldump({
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    dumpToFile: backupFileName,
  })
    .then(() => {
      console.log(`Database backup completed: ${backupFileName}`);
    })
    .catch((err) => {
      console.error('Database backup failed:', err);
    });
});


server.listen(PORT, '0.0.0.0', () => console.log(`Server Connected! -> on port ${PORT}`));
// server.listen(PORT, () => console.log(`Server Connected! -> on port ${PORT}`));