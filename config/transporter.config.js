const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false,
    auth: {
      user: 'dassudipto200@gmail.com',
      pass: 'mpJCFfSGcZKE2bkT',
    },
  });

module.exports = transporter;