const mongoose = require('mongoose');

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
    role: { type: String, required: true },
    mobile: { type: Number, required: false },
    description: { type: String, required: false },
    resume: {required:true,type:String  }
  });
  const Student = mongoose.model('Student', StudentSchema);
  const PostSchema=new mongoose.Schema({
    content:{required:true,type:String},
    photo:{required:false,type:String},
    type:{required:false,type:String}, 
  
    user:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'Student'},
  },{timestamps:true})
  const Post =mongoose.model('Post',PostSchema)

module.exports = {
    College,
    Company,
    CollegeDetails,
    CompanyDetails,
    Message,
    Student,
    Post
  };