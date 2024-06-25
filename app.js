const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const cors=require('cors');
const path = require('path');
const { College, Company, CollegeDetails, CompanyDetails, Message, Student,Post } = require('./models/allmodels');
const fs =require('fs');
const {collegeLogin,registerCollege, getCollegeDetails, getSpecificCollegeDetails, getAllCollegeDetails, checkCollege, contactCollege, filterCollege, searchCollege, sendMail}=require('./controllers/college.controllers');
const AWS =require('aws-sdk');
const nodemailer =require('nodemailer');
const {uploads,upload}=require('./config/multer.config');
const connectToDatabase = require('./config/db.config');
const { companyLogin, companyRegister, getCompanyDetails, getSpecificCompanyDetails, getAllCompanyDetails, contactCompany, filtercompany, searchCompany } = require('./controllers/company.controllers');
const { getMessages, sendMessageBtw } = require('./controllers/message.controller');
const { studentRegister, studentLogin, getAllStudents, filterStudent, studenDetails, studentsingin } = require('./controllers/student.controller');
const { createPost, allPosts } = require('./controllers/post.controller');
// Set up the Express app
const app = express();
app.set('view engine','ejs');

// Middleware
const s3 =new AWS.S3({
  accessKeyId:"AKIAUMZH7FQ4ID3PS7UF",
  secretAccessKey:"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"
})
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(session({
  secret: 'sdhello102',
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB using Mongoose
connectToDatabase();

app.use(express.static(path.join(__dirname, 'public')));
  // College login route
app.post('/college/login', collegeLogin);

// Company login route
app.post('/company/login',companyLogin );

// College register route
app.post('/college/register', registerCollege);

// Company register route
app.post('/company/register', companyRegister);

  // College details route
  app.post('/college/details/:collegeId', uploads.single('logo'),getCollegeDetails );
// Company details route
app.post('/company/details/:companyId', uploads.single('logo'), getCompanyDetails);
// Get details of a specific company
app.get('/company/details/:companyId',getSpecificCompanyDetails);

// Get details of a specific college
app.get('/college/details/:collegeId',getSpecificCollegeDetails);

// Get all company details
app.get('/company/details',getAllCompanyDetails);

// Get all college details
app.get('/college/details', getAllCollegeDetails);
app.post('/messages',postMessage);
// Get messages between two IDs
// Get messages between two IDs
app.get('/messages', getMessages);
app.post(
  "/register/:collegeId",
  uploads.fields([{ name: "resume", maxCount: 1 }, { name: "profile", maxCount: 1 }]),
  studentRegister
);
app.post('/login/:collegeId', studentLogin);
app.get('/register/:collegeId',checkCollege);
// Define your routes here
app.get('/', (req, res) => {
  res.send('API RUNNING');
});

app.get('/allstudents',getAllStudents);

app.post('/sendmsg',sendMessageBtw);

app.post('/getmsg',getMessages)
app.post('/contactedcol',contactCollege)

app.post('/contactedcom',contactCompany)
app.post('/filtercompany', filtercompany)
app.post('/filtercollege', filterCollege)
app.get('/searchcolname',searchCollege)
app.get('/searchcomname',searchCompany)
app.get('/filterstu',filterStudent)
app.post('/sendemail',sendMail );
app.post('/stdetails',studenDetails )
app.post('/stlogin',studentsingin)
app.post('/createpost',uploads.single('file'),createPost)
app.get('/allposts',allPosts)

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
