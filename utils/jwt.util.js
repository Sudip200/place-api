const jwt = require('jsonwebtoken');
const genarateToken = (user) =>{
  return  jwt.sign(user,"sudi234n%dn32dn",{
    expiresIn:'1d'
  })
}
const verifyToken = (token) => {
  return jwt.verify(token,"sudi234n%dn32dn");
};

module.exports = { verifyToken, genarateToken};