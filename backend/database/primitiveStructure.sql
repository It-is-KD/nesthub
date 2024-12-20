-- Modified usermaster table with default role as 'Student'
CREATE TABLE usermaster (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('Admin', 'Teacher', 'Student', 'HOD') NOT NULL DEFAULT 'Student'
);

-- Department table
CREATE TABLE department (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

-- Batch table
CREATE TABLE batch (
    batch_id INT PRIMARY KEY AUTO_INCREMENT,
    batch_name VARCHAR(50) NOT NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES department(department_id)
);

-- Section table
CREATE TABLE section (
    section_id INT PRIMARY KEY AUTO_INCREMENT,
    section_name VARCHAR(10) NOT NULL,
    batch_id INT,
    FOREIGN KEY (batch_id) REFERENCES batch(batch_id),
    UNIQUE (section_name, batch_id)
);

-- Studentmaster table
CREATE TABLE studentmaster (
    student_id INT PRIMARY KEY,
    section_id INT,
    admission_date DATE NOT NULL,
    current_semester INT NOT NULL CHECK (current_semester BETWEEN 1 AND 8),
    FOREIGN KEY (student_id) REFERENCES usermaster(user_id),
    FOREIGN KEY (section_id) REFERENCES section(section_id)
);

-- Teachermaster table
CREATE TABLE teachermaster (
    teacher_id INT PRIMARY KEY,
    department_id INT,
    joining_date DATE NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES usermaster(user_id),
    FOREIGN KEY (department_id) REFERENCES department(department_id)
);

-- Teacher-Section Assignment table
CREATE TABLE teacher_section_assignment (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT,
    section_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teachermaster(teacher_id),
    FOREIGN KEY (section_id) REFERENCES section(section_id),
    UNIQUE (teacher_id, section_id)
);

-- Subject table
CREATE TABLE subject (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) NOT NULL UNIQUE
);

-- Semester_Subject table
CREATE TABLE semester_subject (
    semester_subject_id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    subject_id INT,
    FOREIGN KEY (department_id) REFERENCES department(department_id),
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id),
    UNIQUE (department_id, semester, subject_id)
);

-- Class Schedule table
CREATE TABLE class_schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    section_id INT,
    semester_subject_id INT,
    teacher_id INT,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (section_id) REFERENCES section(section_id),
    FOREIGN KEY (semester_subject_id) REFERENCES semester_subject(semester_subject_id),
    FOREIGN KEY (teacher_id) REFERENCES teachermaster(teacher_id),
    UNIQUE (section_id, semester_subject_id, day_of_week, start_time)
);

-- Attendance table
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT,
    student_id INT,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    FOREIGN KEY (schedule_id) REFERENCES class_schedule(schedule_id),
    FOREIGN KEY (student_id) REFERENCES studentmaster(student_id),
    UNIQUE (schedule_id, student_id, date)
);



-- --To Automate the batch incrementation process: -
-- -- Modify the batch table to include current_semester
-- ALTER TABLE batch
-- ADD COLUMN current_semester INT NOT NULL DEFAULT 1 CHECK (current_semester BETWEEN 1 AND 8);

-- -- Create a new table for logging semester increments
-- CREATE TABLE semester_increment_log (
--     log_id INT PRIMARY KEY AUTO_INCREMENT,
--     batch_id INT NOT NULL,
--     old_semester INT NOT NULL,
--     new_semester INT NOT NULL,
--     increment_date DATETIME NOT NULL,
--     affected_students INT NOT NULL,
--     FOREIGN KEY (batch_id) REFERENCES batch(batch_id)
-- );

-- -- Create the stored procedure for incrementing batch semester with logging
-- DELIMITER //

-- CREATE PROCEDURE IncrementBatchSemester(IN batch_id_param INT)
-- BEGIN
--     DECLARE current_sem INT;
--     DECLARE affected_rows INT;
    
--     -- Get the current semester for the batch
--     SELECT current_semester INTO current_sem
--     FROM batch
--     WHERE batch_id = batch_id_param;
    
--     -- Increment the semester if it's less than 8
--     IF current_sem < 8 THEN
--         -- Update batch semester
--         UPDATE batch
--         SET current_semester = current_semester + 1
--         WHERE batch_id = batch_id_param;
        
--         -- Update all students in this batch and get the number of affected rows
--         UPDATE studentmaster sm
--         JOIN section s ON sm.section_id = s.section_id
--         SET sm.current_semester = sm.current_semester + 1
--         WHERE s.batch_id = batch_id_param
--         AND sm.current_semester < 8;
        
--         SET affected_rows = ROW_COUNT();
        
--         -- Log the increment
--         INSERT INTO semester_increment_log 
--             (batch_id, old_semester, new_semester, increment_date, affected_students)
--         VALUES 
--             (batch_id_param, current_sem, current_sem + 1, NOW(), affected_rows);
        
--     ELSE
--         -- Log attempt to increment beyond 8th semester
--         INSERT INTO semester_increment_log 
--             (batch_id, old_semester, new_semester, increment_date, affected_students)
--         VALUES 
--             (batch_id_param, current_sem, current_sem, NOW(), 0);
--     END IF;
-- END //

-- DELIMITER ;

-- -- Create an event to automatically increment semesters
-- DELIMITER //

-- CREATE EVENT IncrementSemesterEvent
-- ON SCHEDULE EVERY 6 MONTH
-- STARTS '2024-01-01 00:00:00'
-- DO
-- BEGIN
--     DECLARE done INT DEFAULT FALSE;
--     DECLARE batch_id_var INT;
--     DECLARE batch_cursor CURSOR FOR SELECT batch_id FROM batch WHERE current_semester < 8;
--     DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

--     OPEN batch_cursor;

--     read_loop: LOOP
--         FETCH batch_cursor INTO batch_id_var;
--         IF done THEN
--             LEAVE read_loop;
--         END IF;
--         CALL IncrementBatchSemester(batch_id_var);
--     END LOOP;

--     CLOSE batch_cursor;
-- END //

-- DELIMITER ;

-- -- Enable the event scheduler
-- SET GLOBAL event_scheduler = ON;

-- -- Example of how to manually call the procedure for a specific batch
-- -- CALL IncrementBatchSemester(1);  -- Replace 1 with the actual batch_id

-- -- Query to view logs
-- -- SELECT * FROM semester_increment_log ORDER BY increment_date DESC;