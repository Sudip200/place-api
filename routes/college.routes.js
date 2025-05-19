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
router.post('/college/login', collegeLogin);
router.post('/college/register', registerCollege);

// Protected
router.post('/college/details/:collegeId', auth, upload.single('logo'), getCollegeDetails);
router.get('/college/:collegeId', auth, getSpecificCollegeDetails);
router.get('/college', auth, getAllCollegeDetails);

router.get('/check/:collegeId', checkCollege);
router.post('/college/contact', auth, contactCollege);
router.post('/college/filter', auth, filterCollege);
router.get('/college/search', auth, searchCollege);
router.post('/college/sendmail', auth, sendMail);

module.exports = router;
