const e = require('express');
const {College ,CollegeDetails,Message} = require('../models/allmodels');
const jwt = require('jsonwebtoken');
const AWS =require('aws-sdk');
const s3 = require('../config/aws.config');
const nodemailer =require('nodemailer');
const {uploads,upload}=require('../config/multer.config');
const collegeLogin = async (req, res) => {
    const { email, password } = req.body;
   
    try {
      const college = await College.findOne({ email, password });
      if (!college) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      const token = jwt.sign({ id: college._id }, 'sudipto');
      res.cookie('token', token, { httpOnly: true },expires= new Date(Date.now() + 8*3600000));
      res.json('logged in');
    } catch (error) {
        console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const registerCollege = async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const existingCollege = await College.findOne({ email });
      if (existingCollege) {
        res.status(400).json({ error: 'exists' });
        return;
      }
      const college = new College({ name, email, password });
      await college.save();
      const token = jwt.sign({ id: college._id }, 'sudipto');
      res.cookie('token', token, { httpOnly: true },expires= new Date(Date.now() + 8*3600000));
      res.json('registered');
    } catch (error) {
        console.log(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

const getCollegeDetails = async (req, res) => {
  const { state, city, description, mobile } = req.body;
  const { collegeId } = req.params;

  try {
    // Upload the logo file to S3
    const logoParams = {
      Bucket: "uploadfiles200",
      Key: `${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype, // Set Content-Type based on file type
    };
    const logoUploadResult = await s3.upload(logoParams).promise();

    const collegeDetails = new CollegeDetails({
      state,
      city,
      description,
      mobile,
      logo: logoUploadResult.Location, // Save the S3 URL
      college: collegeId
    });

    await collegeDetails.save();
    res.json({ message: 'College details created successfully' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
const getSpecificCollegeDetails =  async (req, res) => {
  const { collegeId } = req.params;
  const {authorization}=req.headers;
  try {
    if(authorization==='XXLPNK'){
      const collegeDetails = await CollegeDetails.findOne({ college: collegeId }).populate('college');
      if (!collegeDetails) {
        res.status(404).json({ error: 'College details not found' });
        return;
      }
      res.json(collegeDetails);
    }else{
      res.json("auth failed")
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
const getAllCollegeDetails = async (req, res) => {
  const {authorization}=req.headers;
  try {
    if(authorization==='XXLPNK'){
      const collegeDetails = await CollegeDetails.find().populate('college');
      res.json(collegeDetails);
    }else{
      res.json("auth failed")
    }
   
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
const checkCollege =  async (req, res) => {
  const collegeId = req.params.collegeId;
  const college= await CollegeDetails.findOne({college:collegeId}).populate('college')
  if (!college) {
    return res.status(404).send('<h1>College not found</h1>');
  }
  res.render('register', { collegeId,college });
}
const contactCollege = async (req,res)=>{
  const {company}=req.body;
  try{
      const messages= await Message.find({company:company}).populate('college').distinct('college');
      res.json(messages);
  }catch(err){
    res.json(err);
  }
}
const filterCollege = async (req,res)=>{
  const {state,city}=req.body;
  try{
   const companise=await CollegeDetails.find({state:state,city:city}).populate('college');
   res.json(companise)
  }catch(err){
 res.json(err);
  }
}
const searchCollege = async (req, res) => {
  const keyword = req.query.keyword;
  const {authorization}=req.headers;
  try {
    const colleges = await CollegeDetails.aggregate([
      {
        $lookup: {
          from: 'colleges', // Collection name of the associated College model
          localField: 'college',
          foreignField: '_id',
          as: 'college',
        },
      },
      {
        $unwind: '$college',
      },
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
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch colleges' ,error});
  }
}
const sendMail = async (req, res) => {
  const {recep,sender,body,subject}=req.body;
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
      subject: subject,
      text: body,
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent', response: info.response });
  } catch (error) {
    res.json({ error: 'Error sending email', message: error.message });
  }
}


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
    }