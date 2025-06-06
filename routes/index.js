const studentRoutes = require('../routes/student.routes');
const companyRoutes = require('../routes/company.routes')
const collegeRoutes = require('../routes/college.routes');
const postRoutes = require('./post.routes');
const express = require('express');
const router = express.Router();
router.get('/',(req,res)=>{
    res.json({
        message:'API is running'
    })
})

router.use('/student',studentRoutes);
router.use('/college',collegeRoutes);
router.use('/post',postRoutes);
router.use('/company',companyRoutes);

module.exports=router;