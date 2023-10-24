const Chat = require('../models/chatModel');
const User = require('../models/userModel');

module.exports.accessChat = async (req, res) => {
    const { userId } = req.body;
    if(!userId){
        return res.status(400).json({success: false, message: "UserId param not sent with request"});
    }
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users: {$elemMatch: {$eq: req.user._id}}},
            {users: {$elemMatch: {$eq: userId}}},
        ],
    }).populate("users","-password").populate("latestMessage");
    
    isChat = await User.populate(isChat, {path: "latestMessage.sender",select:"name pic email"});

    if(isChat.length>0){
        return res.status(200).json({success: true, message: "Chat found", data: isChat[0]});
    }else{
        var chatData = {
            chatName:"sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        }
        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findById({_id:createdChat._id}).populate("users","-password");
            return res.status(201).json({success: true, message: "Chat created", data: fullChat});
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({success: false, message: "Internal server error"});
        }
    }
}

module.exports.fetchChats = async (req, res) => {
    try {
        var chats = await Chat.find({users: {$elemMatch: {$eq: req.user._id}}}).populate("users","-password").populate("groupAdmin","-password").populate("latestMessage").sort({updatedAt: -1});
        chats = await User.populate(chats, {path: "latestMessage.sender",select:"name pic email"});
        return res.status(200).json({success: true, message: "Chats found", data: chats});
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

module.exports.createGroupChat = async (req, res) => {
    const { chatName, users } = req.body;
    if(!chatName || !users){
        return res.status(400).json({success: false, message: "Please add all the fields"});
    }
    var usersArr = JSON.parse(users);
    if(usersArr.length<2){
        return res.status(400).json({success: false, message: "Please add atleast 2 users to create a group chat"});
    }
    usersArr.push(req.user);
    try {
        const groupChatData = await Chat.create({
            chatName,
            isGroupChat: true,
            users: usersArr,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({_id: groupChatData._id}).populate("users","-password").populate("groupAdmin","-password");
        return res.status(201).json({success: true, message: "Group chat created", data: fullGroupChat});
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

module.exports.renameGroup = async (req, res) => {
    try {
        const { chatId, chatName } = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(
          { _id: chatId },
          { chatName: chatName },
          { new: true }
        )
          .populate("users", "-password")
          .populate("groupAdmin", "-password");
        if(!updatedChat){
            return res.status(400).json({success: false, message: "Chat not found"});
        }
        return res.status(200).json({ success: true, message: "Chat renamed", data: updatedChat });
    } catch (error) {
        console.error(error.message);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
    }
}

module.exports.addToGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const added = await Chat.findByIdAndUpdate({_id: chatId},{$push: {users: userId}},{new: true}).populate("users","-password").populate("groupAdmin","-password");
        if(!added){
            return res.status(400).json({success: false, message: "Chat not found"});
        }
        return res.status(200).json({ success: true, message: "User added to group", data: added });        
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.removeFromGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const remove = await Chat.findByIdAndUpdate({_id: chatId},{$pull: {users: userId}},{new: true}).populate("users","-password").populate("groupAdmin","-password");
        if(!remove){
            return res.status(400).json({success: false, message: "Chat not found"});
        }
        return res.status(200).json({ success: true, message: "User removed from group", data: remove });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}