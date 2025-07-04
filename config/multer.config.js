const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extname = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extname);
    }
  });
  const storages = multer.memoryStorage();
  // Create the Multer upload object
  const uploads=multer({storages});
  
  const upload = multer({ storage });

module.exports ={
    upload,
    uploads
}