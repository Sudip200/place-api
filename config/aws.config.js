const AWS =require('aws-sdk');
const s3 =new AWS.S3({
    accessKeyId:"AKIAUMZH7FQ4ID3PS7UF",
    secretAccessKey:"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"
  })

module.exports = s3;