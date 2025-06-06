const express = require('express');
const bodyParser = require('body-parser');
const cors=require('cors');
const path = require('path');
const connectToDatabase = require('./config/db.config');
const indexRoutes = require('./routes/index');
const app = express();

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

connectToDatabase();

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1',indexRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
