const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');

// Set up the Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
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
const College = mongoose.model('College', new mongoose.Schema({
    name: String,
    email: String,
    password: String
  }));
  
  // CompanySchema model
  const Company = mongoose.model('Company', new mongoose.Schema({
    name: String,
    email: String,
    password: String
  }));
  const CollegeDetailsSchema = new mongoose.Schema({
    state: String,
    city: String,
    description: String,
    logo: String,
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }
  });
  
  const CollegeDetails = mongoose.model('CollegeDetails', CollegeDetailsSchema);
  const CompanyDetailsSchema = new mongoose.Schema({
    state: String,
    city: String,
    description: String,
    logo: String,
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
  });
  
  const CompanyDetails = mongoose.model('CompanyDetails', CompanyDetailsSchema);
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
      res.json({ token });
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
      const token = jwt.sign({ id: company._id }, 'your_secret_key');
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // College register route
  app.post('/college/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const college = new College({ name, email, password });
      await college.save();
      res.json({ message: 'College registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Company register route
  app.post('/company/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const company = new Company({ name, email, password });
      await company.save();
      res.json({ message: 'Company registered successfully' });
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
