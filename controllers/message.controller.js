const { Message } = require('../models/allmodels');
const AWS =require('aws-sdk');
const s3 = require('../config/aws.config');
const {uploads,upload}=require('../config/multer.config');
const transporter = require('../config/transporter.config');
const postMessage=async (req, res) => {
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
  }
  const getMessages =async (req, res) => {
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
  }

  const sendMessageBtw =  async (req, res) => {
    const { message, college, company } = req.body;
    try {
      const newMessage = new Message({ message: message, college: college, company: company });
      await newMessage.save();
      const companyemail= await Company.findById(company);
      const collegeemail=await College.findById(college);
      const mailOptions = {
        from: 'dassudipto200@gmail.com',
        to: `${companyemail.email},${collegeemail.email}`,
        subject: "You have new message",
        html: `<!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
        
            h2 {
              color: #007BFF;
              margin-bottom: 10px;
            }
        
            p {
              margin: 5px 0;
            }
        
            strong {
              font-weight: bold;
            }
        
            .container {
              background-color: #f0f0f0;
              padding: 20px;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
        
            .message-box {
              background-color: #dcdcdc;
              padding: 10px;
              border-radius: 5px;
              margin: 10px 0;
            }
        
            .signature {
              font-style: italic;
              color: #555555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>You have a new message</h2>
            <div class="message-box">
              <p><strong>Message:</strong> "${message}"</p>
            </div>
            <p>between ${companyemail.name} and ${collegeemail.name}</p>
            <p>Please check the chat section in your app.</p>
          </div>
          <p class="signature">Thanks,<br>CollegeHire</p>
        </body>
        </html>
        `,
      };
  
      const info = await transporter.sendMail(mailOptions);
     // res.json({ message: 'Email sent', response: info.response });
      res.json({ msg: 'sent' });
    } catch (err) {
      res.json(err);
    }
  }
 const getMessagesAll = async (req,res)=>{
    const {college,company}=req.body;
    try{
      const message= await Message.find({college:college,company:company}).sort({ timestamp: 1 })
      res.json(message)
    }catch(err){
      res.json(err);
    }
  }
module.exports = {
    postMessage,
    getMessages,
    sendMessageBtw,
    getMessagesAll
}