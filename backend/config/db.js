const mongoose = require('mongoose');

const DBConnection = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`DB: ${conn.connection.host} connected successfully!!!`);
  } catch (error) {
    console.log("Error while connecting with the database ", error.message);
    process.exit();
  }
};

module.exports = {
  DBConnection,
};