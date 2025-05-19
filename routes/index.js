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

router.use(studentRoutes);
router.use(collegeRoutes);
router.use(postRoutes);
router.use(companyRoutes);

module.exports=router;