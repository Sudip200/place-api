const express = require('express');
const router = express.Router();
const {
  collegeLogin,
  registerCollege,
  getCollegeDetails,
  getSpecificCollegeDetails,
  getAllCollegeDetails,
  checkCollege,
  contactCollege,
  filterCollege,
  searchCollege,
  sendMail
} = require('../controllers/college.controllers');

const auth = require('../middlewares/auth.middlewares');
const { upload } = require('../config/multer.config');

// Public
router.post('/login', collegeLogin);
router.post('/register', registerCollege);

// Protected
router.post('/details/:collegeId', auth, upload.single('logo'), getCollegeDetails);
router.get('/:collegeId', auth, getSpecificCollegeDetails);
router.get('', auth, getAllCollegeDetails);

router.get('/check/:collegeId', checkCollege);
router.post('/contact', auth, contactCollege);
router.post('/filter', auth, filterCollege);
router.get('/search', auth, searchCollege);
router.post('/sendmail', auth, sendMail);

module.exports = router;
