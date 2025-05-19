const bcrypt = require('bcrypt');

const hashPassword = async (password) =>{
    try{
      const salts = 10
      const hashedPassword = await bcrypt.hash(password,salts);
      return hashedPassword
    }catch(err){
      console.log('Some error occurred');  
    }
}
const comparePassword = async (password,hashPassword) =>{
     try{ 
     const compare = await bcrypt.compare(password,hashPassword)
     return compare;
     }catch(err){
     console.log('Some error occured while comparing passwords');
     }
}

module.exports={
    comparePassword,
    hashPassword
}