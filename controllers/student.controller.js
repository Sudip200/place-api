const {Student} = require('../models/allmodels');
const AWS =require('aws-sdk');
const s3 = require('../config/aws.config');
const {uploads,upload}=require('../config/multer.config');
const studentRegister = async (req, res) => {
    try {
      const { name, open, skill, email, password, mobile, description,role } = req.body;
      const collegeId = req.params.collegeId;
      const resumeData = req.files["resume"][0];
      const profileData = req.files["profile"][0];

      // Upload the resume file to S3
      const resumeParams = {
        Bucket: "uploadfiles200",
        Key: `${Date.now()}_${resumeData.originalname}`,
        ContentType: resumeData.mimetype,
        Body: resumeData.buffer,
      };
      const resumeUploadResult = await s3.upload(resumeParams).promise();

      // Upload the profile file to S3
      const profileParams = {
        Bucket: "uploadfiles200",
        Key: `${Date.now()}_${profileData.originalname}`,
        ContentType: profileData.mimetype,
        Body: profileData.buffer,
      };
      const profileUploadResult = await s3.upload(profileParams).promise();

      console.log(resumeUploadResult);
      console.log(profileUploadResult);

      // Create a new student instance
      const student = new Student({
        name,
        open,
        college: collegeId,
        skill,
        email,
        password,
        mobile,
        role,
        description,
        resume: resumeUploadResult.Location, // Save the S3 URL
        profile: profileUploadResult.Location, // Save the S3 URL
      });

      // Save the student to the database
      await student.save();

      res.status(201).send('Registration Successful');
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }

const studentLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const collegeId = req.params.collegeId;
  
      // Check if the student exists in the given college
      const student = await Student.findOne({ email, college: collegeId });
  
      if (!student) {
        res.status(404).json({ error: 'Student not found' });
      } else {
        if (student.password === password) {
          res.status(200).json({ message: 'Login successful' });
        } else {
          res.status(401).json({ error: 'Invalid password' });
        }
      }
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while logging in' });
    }
  }
const getAllStudents = async (req,res)=>{
    const {authorization}=req.headers;
   try{
    if(authorization==='XXLPNK'){
      const students=await Student.find({}).sort({skill:-1}).populate('college');
      res.json(students);
    }else{
      res.json("auth failed")
    }
    
   }catch(err){
     res.json(err)
   }
  }
const filterStudent = async (req,res)=>{
    const keyword = req.query.keyword;
    const {authorization}=req.headers;
    try {
      const students = await Student.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { skill: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { role: { $regex: keyword, $options: 'i' } }
  
        ],
      }).populate('college');
  
      res.json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to fetch students' });
    }
  }
  const studenDetails = async (req, res) => {
  
    try {
      const { studentId } = req.body;
      console.log(studentId)
      const student = await Student.findById(studentId).populate('college');
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(student);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
const studentsingin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const student = await Student.findOne({ email, password });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(student._id);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  module.exports = {
    studentRegister,
    studentLogin,
    getAllStudents,
    filterStudent,
    studenDetails,
    studentsingin
  }