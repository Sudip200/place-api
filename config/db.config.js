const mongoose = require('mongoose');
function connectToDatabase() {
    mongoose.connect('mongodb+srv://dassudipto200:B8sRC8IqhLHvJzP2@cluster0.c0ugejs.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }).then(() => {
        console.log('Connected to MongoDB');
      }).catch((error) => {
        console.error('Error connecting to MongoDB:', error);
      });
}
module.exports = connectToDatabase;