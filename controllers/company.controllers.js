const { Company, CompanyDetails, Message } = require('../models/allmodels');
const jwt = require('jsonwebtoken');
const s3 = require('../config/aws.config');
const { hashPassword, comparePassword } = require('../utils/hash.util');

// REGISTER
const companyRegister = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const company = new Company({ name, email, password: hashedPassword });
    await company.save();

    const token = jwt.sign({ id: company._id }, 'sudi234n%dn32dn', { expiresIn: '8h' });

    res.status(201).json({ message: 'Company registered successfully', token, id: company._id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const companyLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const company = await Company.findOne({ email });
    console.log(company);
    if (!company) return res.status(401).json({ error: 'Invalid credentials' });
    console.log(company);
    const isMatch = await comparePassword(password, company.password);
    console.log(isMatch)
    if (!isMatch) return res.status(401).json({ error: 'Incorrect password' });
    const token = jwt.sign({ id: company._id }, 'sudi234n%dn32dn', { expiresIn: '8h' });

    res.json({ message: 'Login successful', token, id: company._id });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }
};

// CREATE COMPANY DETAILS + LOGO UPLOAD
const getCompanyDetails = async (req, res) => {
  const { state, city, description, mobile } = req.body;
  const companyId = req.user.id;

  try {
    const logoParams = {
      Bucket: 'uploadfiles200',
      Key: `${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const logoUploadResult = await s3.upload(logoParams).promise();

    const companyDetails = new CompanyDetails({
      state,
      city,
      description,
      mobile,
      logo: logoUploadResult.Location,
      company: companyId,
    });

    await companyDetails.save();
    res.status(201).json({ message: 'Company details created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
};

// GET COMPANY DETAILS (FOR LOGGED IN COMPANY)
const getSpecificCompanyDetails = async (req, res) => {
  const companyId = req.user.id;

  try {
    const companyDetails = await CompanyDetails.findOne({ company: companyId }).populate('company');
    if (!companyDetails) return res.status(404).json({ error: 'Company details not found' });

    res.json(companyDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET ALL COMPANY DETAILS
const getAllCompanyDetails = async (req, res) => {
  try {
    const allDetails = await CompanyDetails.find().populate('company');
    res.json(allDetails);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal server error' });
  }
};

// FILTER COMPANY
const filtercompany = async (req, res) => {
  const { state, city } = req.body;
  try {
    const results = await CompanyDetails.find({ state, city }).populate('company');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// SEARCH COMPANIES BY KEYWORD
const searchCompany = async (req, res) => {
  const keyword = req.query.keyword;
  try {
    const companies = await CompanyDetails.aggregate([
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'company',
        },
      },
      { $unwind: '$company' },
      {
        $match: {
          $or: [
            { state: { $regex: keyword, $options: 'i' } },
            { city: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { 'company.name': { $regex: keyword, $options: 'i' } },
          ],
        },
      },
    ]);

    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// GET COMPANIES A COLLEGE CONTACTED
const contactCompany = async (req, res) => {
  const { college } = req.body;
  try {
    const messages = await Message.find({ college }).populate('company').distinct('company');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  companyRegister,
  companyLogin,
  getCompanyDetails,
  getSpecificCompanyDetails,
  getAllCompanyDetails,
  contactCompany,
  filtercompany,
  searchCompany,
};
