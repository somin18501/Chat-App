const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

module.exports.generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};