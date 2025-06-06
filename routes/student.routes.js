const express = require('express');
const router = express.Router();
const {
  studentRegister,
  studentLogin,
  getAllStudents,
  filterStudent,
  studentDetails,
  studentSignin
} = require('../controllers/student.controller');

const auth = require('../middlewares/auth.middlewares');
const { upload } = require('../config/multer.config');

// Public routes
router.post('/login/:collegeId', studentLogin);
router.post('/signin', studentSignin);

// Registration with file upload (resume and profile)
router.post(
  '/register/:collegeId',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profile', maxCount: 1 }
  ]),
  studentRegister
);

// Protected routes
router.get('/all', auth, getAllStudents);
router.get('/filter', auth, filterStudent);
router.post('/details', auth, studentDetails);

module.exports = router;
