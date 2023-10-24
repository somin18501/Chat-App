const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

module.exports.sendMessage = async (req, res) => {
    const { content, chatId } = req.body;
    if(!content || !chatId){
        return res.status(400).json({success: false, message: "Invalid message data"});
    }
    const newMsg = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    }
    try {
        var msg = await Message.create(newMsg);
        msg = await msg.populate("sender","name pic");
        msg = await msg.populate("chat");
        msg = await User.populate(msg, {path: "chat.users",select:"name pic email"});

        await Chat.findByIdAndUpdate(req.body.chatId,{latestMessage: msg});
        return res.status(201).json({success: true, message: "Message sent", data: msg});
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports.allMessages = async (req, res) => {
    try {
        const msgs = await Message.find({chat: req.params.chatId}).populate("sender","name pic email").populate("chat");
        return res.status(200).json({success: true, message: "Messages found", data: msgs})
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}