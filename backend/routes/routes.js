const { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup } = require("../controllers/chatController");
const { sendMessage, allMessages } = require("../controllers/msgController");
const { Signup, Login, allUsers } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = require("express").Router();

// user routes
router.post('/login',Login);
router.post('/signup',Signup);
router.get('/user', protect, allUsers);

// chat routes
router.post('/access1v1chat', protect, accessChat);
router.get("/getmychats", protect, fetchChats);
router.post("/creategroupchat", protect, createGroupChat);
router.put("/renamegroup", protect, renameGroup);
router.put("/addtogroup", protect, addToGroup);
router.put("/removefromgroup", protect, removeFromGroup);

// message routes
router.post("/sendmsg", protect, sendMessage);
router.get('/getmsg/:chatId', protect, allMessages);

module.exports = router;