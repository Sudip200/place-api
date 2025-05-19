const { Student } = require('../models/allmodels');
const AWS = require('aws-sdk');
const s3 = require('../config/aws.config');
const { upload } = require('../config/multer.config');
const {comparePassword,hashPassword} = require('../utils/hash.util')
const {genarateToken} = require('../utils/jwt.util');
const studentRegister = async (req, res) => {
  try {
    const { name, open, skill, email, password, mobile, description, role } = req.body;
    const collegeId = req.params.collegeId;

    const resumeData = req.files['resume'][0];
    const profileData = req.files['profile'][0];

    const resumeParams = {
      Bucket: "uploadfiles200",
      Key: `${Date.now()}_${resumeData.originalname}`,
      ContentType: resumeData.mimetype,
      Body: resumeData.buffer,
    };
    const resumeUploadResult = await s3.upload(resumeParams).promise();

    const profileParams = {
      Bucket: "uploadfiles200",
      Key: `${Date.now()}_${profileData.originalname}`,
      ContentType: profileData.mimetype,
      Body: profileData.buffer,
    };
    const profileUploadResult = await s3.upload(profileParams).promise();

    const hashed = await hashPassword(password); // 🔐 Use your helper

    const student = new Student({
      name,
      open,
      college: collegeId,
      skill,
      email,
      password: hashed,
      mobile,
      role,
      description,
      resume: resumeUploadResult.Location,
      profile: profileUploadResult.Location,
    });

    await student.save();

    res.status(201).json({ message: 'Registration Successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const collegeId = req.params.collegeId;

    const student = await Student.findOne({ email, college: collegeId });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const isMatch = await comparePassword(password, student.password); 

    if (isMatch) {
      const token = genarateToken({ id: student._id, email: student.email, role: 'student' });
      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}).sort({ skill: -1 }).populate('college');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const filterStudent = async (req, res) => {
  const keyword = req.query.keyword || '';
  try {
    const students = await Student.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { skill: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { role: { $regex: keyword, $options: 'i' } },
      ],
    }).populate('college');

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const studentDetails = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId).populate('college');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const studentSignin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email, password });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ studentId: student._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  studentRegister,
  studentLogin,
  getAllStudents,
  filterStudent,
  studentDetails,
  studentSignin,
};
