const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const cors=require('cors');
const path = require('path');
const fs =require('fs');
const AWS =require('aws-sdk');
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
mongoose.connect('mongodb+srv://dassudipto200:B8sRC8IqhLHvJzP2@cluster0.c0ugejs.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname);
  }
});
const storages = multer.memoryStorage();
// Create the Multer upload object
const uploads=multer({storages});
app.use(express.static(path.join(__dirname, 'public')));
const upload = multer({ storage });
const College = mongoose.model('College', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
}));

const Company = mongoose.model('Company', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
}));

const CollegeDetailsSchema = new mongoose.Schema({
  state: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  mobile: { type: Number, required: true },
  logo: { type: String, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
});

const CollegeDetails = mongoose.model('CollegeDetails', CollegeDetailsSchema);

const CompanyDetailsSchema = new mongoose.Schema({
  state: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  mobile: { type: Number, required: true },
  logo: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
});

const CompanyDetails = mongoose.model('CompanyDetails', CompanyDetailsSchema);

  // CollegeMessageSchema model
  const MessageSchema = new mongoose.Schema({
    message: String,
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
  }, { timestamps: true });
  

const Message = mongoose.model('CollegeMessage', MessageSchema);

const StudentSchema = new mongoose.Schema({
  profile:{required:true,type:String},
  name: { required: true, type: String },
  open: { required: false, type: String },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  skill: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  mobile: { type: Number, required: false },
  description: { type: String, required: false },
  resume: {required:true,type:String  }
});
const Student = mongoose.model('Student', StudentSchema);

  // College login route
app.post('/college/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const college = await College.findOne({ email, password });
    if (!college) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ id: college._id }, 'your_secret_key');
    res.json({ id: college._id, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Company login route
app.post('/company/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const company = await Company.findOne({ email, password });
    if (!company) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.json({ id: company._id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// College register route
app.post('/college/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingCollege = await College.findOne({ email });
    if (existingCollege) {
      res.status(400).json({ error: 'exists' });
      return;
    }
    const college = new College({ name, email, password });
    await college.save();
    res.json({ id: college._id, message: 'College registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Company register route
app.post('/company/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingCom = await Company.findOne({ email });
    if (existingCom) {
      res.status(400).json({ error: 'exists' });
      return;
    }
    const company = new Company({ name, email, password });
    await company.save();
    res.json({ id: company._id, message: 'Company registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

  // College details route
  app.post('/college/details/:collegeId', uploads.single('logo'), async (req, res) => {
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
  });
// Company details route
app.post('/company/details/:companyId', uploads.single('logo'), async (req, res) => {
  const { state, city, description, mobile } = req.body;
  const { companyId } = req.params;

  try {
    // Upload the logo file to S3
    const logoParams = {
      Bucket: "uploadfiles200",
      Key: `${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: req.file.mimetype, // Set Content-Type based on file type
    };
    const logoUploadResult = await s3.upload(logoParams).promise();

    const companyDetails = new CompanyDetails({
      state,
      city,
      description,
      mobile,
      logo: logoUploadResult.Location, // Save the S3 URL
      company: companyId
    });

    await companyDetails.save();
    res.json({ message: 'Company details created successfully' });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
// Get details of a specific company
app.get('/company/details/:companyId', async (req, res) => {
  const { companyId } = req.params;
  const {authorization}=req.headers;

  try {
    if(authorization==='XXLPNK'){
      const companyDetails = await CompanyDetails.findOne({ company: companyId }).populate('company');
      if (!companyDetails) {
        res.status(404).json({ error: 'Company details not found' });
        return;
      }
      res.json(companyDetails);
    }else{
      res.json("auth failed")
    }
  
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get details of a specific college
app.get('/college/details/:collegeId', async (req, res) => {
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
});

// Get all company details
app.get('/company/details', async (req, res) => {
  const {authorization}=req.headers;
  try {
    if(authorization==='XXLPNK'){
      const companyDetails = await CompanyDetails.find().populate('company');
      res.json(companyDetails);
    }else{
      res.json("auth failed")
    }
   
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all college details
app.get('/college/details', async (req, res) => {
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
});
app.post('/messages', async (req, res) => {
  const { message, collegeId, companyId } = req.body;

  try {
    const newMessage = new Message({
      message,
      college: collegeId,
      company: companyId
    });
    await newMessage.save();
    res.json({ message: 'Message created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Get messages between two IDs
// Get messages between two IDs
app.get('/messages', async (req, res) => {
  const collegeId = req.query.collegeId;
  const companyId = req.query.companyId;

  console.log(collegeId+   +companyId)

  try {
    const messages = await Message.find({
      college: collegeId,
      company: companyId
    }).sort({ timestamp: 'asc' });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post(
  "/register/:collegeId",
  uploads.fields([{ name: "resume", maxCount: 1 }, { name: "profile", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { name, open, skill, email, password, mobile, description } = req.body;
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
);
app.post('/login/:collegeId', async (req, res) => {
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
});
app.get('/register/:collegeId', async (req, res) => {
  const collegeId = req.params.collegeId;
  const college= await CollegeDetails.findOne({college:collegeId}).populate('college')
  if (!college) {
    return res.status(404).send('<h1>College not found</h1>');
  }

  res.render('register', { collegeId,college });
});
// Define your routes here
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.get('/allstudents',async (req,res)=>{
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
})
app.post('/sendmsg', async (req, res) => {
  const { message, college, company } = req.body;
  console.log(req.body);
  try {
    const newMessage = new Message({ message: message, college: college, company: company });
    await newMessage.save();
    res.json({ msg: 'sent' });
  } catch (err) {
    res.json(err);
  }
});

app.post('/getmsg',async (req,res)=>{
  const {college,company}=req.body;
  try{
    const message= await Message.find({college:college,company:company}).sort({ timestamp: 1 })
    res.json(message)
  }catch(err){
    res.json(err);
  }
})
app.post('/contactedcol',async (req,res)=>{
  const {company}=req.body;
  try{
      const messages= await Message.find({company:company}).populate('college').distinct('college');
    
      res.json(messages);
  }catch(err){
    res.json(err);
  }
})

app.post('/contactedcom',async (req,res)=>{
  const {college}=req.body;
  try{
      const messages= await Message.find({college:college}).populate('company').distinct('company');
      res.json(messages);
  }catch(err){
    res.json(err);
  }
})



// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
