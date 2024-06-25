const {Company,CompanyDetails,Message} = require('../models/allmodels');
const AWS =require('aws-sdk');
const jwt = require('jsonwebtoken');
const s3 = require('../config/aws.config');
const transporter = require('../config/transporter.config');
const {uploads,upload}=require('../config/multer.config');
const companyRegister = async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const existingCom = await Company.findOne({ email });
      if (existingCom) {
        res.status(400).json({ error: 'exists' });
        return;
      }
      const company = new Company({ name, email, password });
      await company.save();
      const token = jwt.sign({ id: company._id }, 'sudipto');
      res.cookie('token', token, { httpOnly: true },expires= new Date(Date.now() + 8*3600000));
      res.json({ id: company._id, message: 'Company registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }


const companyLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
      const company = await Company.findOne({ email, password });
      if (!company) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      const token = jwt.sign({ id: company._id }, 'sudipto');
      res.cookie('token', token, { httpOnly: true },expires= new Date(Date.now() + 8*3600000));
      res.json({ id: company._id });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
}
const getCompanyDetails = async (req, res) => {
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
  }
  const getSpecificCompanyDetails = async (req, res) => {
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
  }

  const getAllCompanyDetails =  async (req, res) => {
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
  }
  const contactCompany = async (req,res)=>{
    const {college}=req.body;
    try{
        const messages= await Message.find({college:college}).populate('company').distinct('company');
        res.json(messages);
    }catch(err){
      res.json(err);
    }
  }
const filtercompany = async (req,res)=>{
    const {state,city}=req.body;
    try{
     const companise=await CompanyDetails.find({state:state,city:city}).populate('company');
     res.json(companise)
    }catch(err){
   res.json(err);
    }
  }
const searchCompany = async (req, res) => {
    const keyword = req.query.keyword;
    const {authorization}=req.headers;
    try {
      const companies = await CompanyDetails.aggregate([
        {
          $lookup: {
            from: 'companies', // Collection name of the associated Company model
            localField: 'company',
            foreignField: '_id',
            as: 'company',
          },
        },
        {
          $unwind: '$company',
        },
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
      console.error(error);
      res.status(500).json({ success: false, error: 'Failed to fetch colleges' ,error});
    }
  }




  module.exports = {
    companyRegister,
    companyLogin,
    getCompanyDetails,
    getSpecificCompanyDetails,
    getAllCompanyDetails,
    contactCompany,
    filtercompany,
    searchCompany
    }