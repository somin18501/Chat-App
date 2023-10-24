const { generateToken } = require("../config/secretToken");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

module.exports.Signup = async (req, res) => {
  try {
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please add all the fields" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const user = await User.create({ name, email, password, pic });
    if (user) {
      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data:{
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: token,
        },
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please add all the fields" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    return res
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully",
        data:{
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: token,
        },
      });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports.allUsers = async (req, res) => {
  const keyword = req.query.search
  ?  {
    $or:[
      {name:{ $regex:req.query.search, $options:'i' }},
      {email:{ $regex:req.query.search, $options:'i' }},
    ],
  }: {};
  const users = await User.find(keyword).find({_id:{$ne:req.user._id}});
  return res.status(200).json({ success: true, message: "All users", data: users });
}