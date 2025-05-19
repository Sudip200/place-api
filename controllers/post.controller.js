const { Post } = require('../models/allmodels')
const AWS =require('aws-sdk');
const s3 = require('../config/aws.config');
const {uploads,upload}=require('../config/multer.config');
const createPost = async (req,res)=>{
    const {id,content,type}=req.body;
    const file=req.file;
    try{
      const photoParams = {
        Bucket: "uploadfiles200",
        Key: `${Date.now()}_${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype, // Set Content-Type based on file type
      };
      const logoUploadResult = await s3.upload(photoParams).promise();
      const post =new Post({content:content,user:id,photo:logoUploadResult.Location,type:type});
      await  post.save();
      res.json('uploaded');
    }catch(error){
      res.json(error);
    }
  }
const allPosts = async (req,res)=>{
    try{
    const posts= await Post.find({}).populate('user');
      res.json(posts);
    }catch(error){
      res.json(error);
    }
  }
  module.exports={createPost,allPosts}