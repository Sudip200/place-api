const express = require('express');
const router = express.Router();
const {
  companyRegister,
  companyLogin,
  getCompanyDetails,
  getSpecificCompanyDetails,
  getAllCompanyDetails,
  contactCompany,
  filtercompany,
  searchCompany
} = require('../controllers/company.controllers');

const auth = require('../middlewares/auth.middlewares');  
const { upload } = require('../config/multer.config');

// Public routes
router.post('/register', companyRegister);
router.post('/login', companyLogin);

// Protected routes
router.post('/details/:companyId', auth, upload.single('logo'), getCompanyDetails);
router.get('/:companyId', auth, getSpecificCompanyDetails);
router.get('', auth, getAllCompanyDetails);

router.post('/contact', auth, contactCompany);
router.post('/filter', auth, filtercompany);
router.get('/search', auth, searchCompany);

module.exports = router;
