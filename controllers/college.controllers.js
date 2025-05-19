const { College, CollegeDetails, Message } = require('../models/allmodels');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const s3 = require('../config/aws.config');
const nodemailer = require('nodemailer');
const { generateToken } = require('../utils/jwt.util');
const { hashPassword, comparePassword } = require('../utils/hash.util');

// LOGIN
const collegeLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if(!email || !password){
      return res.status(401).json({message:'please enter all fields'})
    }
    const college = await College.findOne({ email });
    const isSamePassword = await comparePassword(password,college.password)
    if (!college || !isSamePassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken({ id: college._id });
    res.json({ message: 'logged in', token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// REGISTER
const registerCollege = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingCollege = await College.findOne({ email });
    if (existingCollege) {
      return res.status(400).json({ error: 'College already exists' });
    }
    const hashedPassword = await hashPassword(password);

    const college = new College({ name, email, password:hashedPassword });
    await college.save();

    const token = generateToken({ id: college._id });
    res.json({ message: 'registered', token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// CREATE COLLEGE DETAILS (with image upload)
const getCollegeDetails = async (req, res) => {
  const { state, city, description, mobile } = req.body;
  const { collegeId } = req.params;

  try {
    const logoParams = {
      Bucket: 'uploadfiles200',
      Key: `${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const logoUploadResult = await s3.upload(logoParams).promise();

    const collegeDetails = new CollegeDetails({
      state,
      city,
      description,
      mobile,
      logo: logoUploadResult.Location,
      college: collegeId,
    });

    await collegeDetails.save();
    res.json({ message: 'College details created successfully' });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// GET SPECIFIC COLLEGE DETAILS
const getSpecificCollegeDetails = async (req, res) => {
  const { collegeId } = req.params;

  try {
    const collegeDetails = await CollegeDetails.findOne({ college: collegeId }).populate('college');
    if (!collegeDetails) {
      return res.status(404).json({ error: 'College details not found' });
    }
    res.json(collegeDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET ALL COLLEGE DETAILS
const getAllCollegeDetails = async (req, res) => {
  try {
    const collegeDetails = await CollegeDetails.find().populate('college');
    res.json(collegeDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// CHECK COLLEGE
const checkCollege = async (req, res) => {
  const { collegeId } = req.params;

  try {
    const college = await CollegeDetails.findOne({ college: collegeId }).populate('college');
    if (!college) {
      return res.status(404).send('<h1>College not found</h1>');
    }

    res.render('register', { collegeId, college });
  } catch (error) {
    res.status(500).json({ error: 'Error checking college' });
  }
};

// CONTACT COLLEGE
const contactCollege = async (req, res) => {
  const { company } = req.body;

  try {
    const messages = await Message.find({ company }).populate('college').distinct('college');
    res.json(messages);
  } catch (err) {
    res.json(err);
  }
};

// FILTER COLLEGE
const filterCollege = async (req, res) => {
  const { state, city } = req.body;

  try {
    const colleges = await CollegeDetails.find({ state, city }).populate('college');
    res.json(colleges);
  } catch (err) {
    res.json(err);
  }
};

// SEARCH COLLEGE
const searchCollege = async (req, res) => {
  const keyword = req.query.keyword;

  try {
    const colleges = await CollegeDetails.aggregate([
      {
        $lookup: {
          from: 'colleges',
          localField: 'college',
          foreignField: '_id',
          as: 'college',
        },
      },
      { $unwind: '$college' },
      {
        $match: {
          $or: [
            { state: { $regex: keyword, $options: 'i' } },
            { city: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { 'college.name': { $regex: keyword, $options: 'i' } },
          ],
        },
      },
    ]);

    res.json(colleges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch colleges', details: error.message });
  }
};

// SEND MAIL
const sendMail = async (req, res) => {
  const { recep, sender, body, subject } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false,
    auth: {
      user: 'dassudipto200@gmail.com',
      pass: 'mpJCFfSGcZKE2bkT',
    },
  });

  try {
    const mailOptions = {
      from: sender,
      to: recep,
      subject,
      text: body,
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent', response: info.response });
  } catch (error) {
    res.json({ error: 'Error sending email', message: error.message });
  }
};

module.exports = {
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
};
