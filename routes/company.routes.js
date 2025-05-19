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
router.post('/company/register', companyRegister);
router.post('/company/login', companyLogin);

// Protected routes
router.post('/company/details/:companyId', auth, upload.single('logo'), getCompanyDetails);
router.get('/company/:companyId', auth, getSpecificCompanyDetails);
router.get('/company', auth, getAllCompanyDetails);

router.post('/company/contact', auth, contactCompany);
router.post('/company/filter', auth, filtercompany);
router.get('/company/search', auth, searchCompany);

module.exports = router;
