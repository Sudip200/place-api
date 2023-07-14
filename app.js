const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const cors=require('cors');
const path = require('path');
// Set up the Express app
const app = express();

// Middleware
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

// Create the Multer upload object
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
app.post('/college/details/:collegeId', upload.single('logo'), async (req, res) => {
  const { state, city, description,mobile } = req.body;
  const { collegeId } = req.params;

  try {
    const collegeDetails = new CollegeDetails({
      state,
      city,
      description,
      mobile,
      logo: req.file.filename,
      college: collegeId
    });
    await collegeDetails.save();
    res.json({ message: 'College details created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Company details route
app.post('/company/details/:companyId', upload.single('logo'), async (req, res) => {
  const { state, city, description } = req.body;
  const { companyId } = req.params;

  try {
    const companyDetails = new CompanyDetails({
      state,
      city,
      description,
      logo: req.file.filename.replace('public',''),
      company: companyId
    });
    await companyDetails.save();
    res.json({ message: 'Company details created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Get details of a specific company
app.get('/company/details/:companyId', async (req, res) => {
  const { companyId } = req.params;
   console.log(companyId)
  try {
    const companyDetails = await CompanyDetails.findOne({ company: companyId }).populate('company');
    if (!companyDetails) {
      res.status(404).json({ error: 'Company details not found' });
      return;
    }
    res.json(companyDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get details of a specific college
app.get('/college/details/:collegeId', async (req, res) => {
  const { collegeId } = req.params;

  try {
    const collegeDetails = await CollegeDetails.findOne({ college: collegeId }).populate('college');
    if (!collegeDetails) {
      res.status(404).json({ error: 'College details not found' });
      return;
    }
    res.json(collegeDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all company details
app.get('/company/details', async (req, res) => {
  try {
    const companyDetails = await Company.find();
    res.json(companyDetails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all college details
app.get('/college/details', async (req, res) => {
  try {
    const collegeDetails = await College.find();
    res.json(collegeDetails);
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

// Define your routes here
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
