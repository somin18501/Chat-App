const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const route = require('./routes/routes.js');
const { chats } = require('./data/data'); // dummy data
const { DBConnection } = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errormiddleware.js');
const app = express();
const port = process.env.PORT || 5000;

dotenv.config();

DBConnection();

const server = app.listen(port, () => {
  console.log(`Server Running at ${port}`)
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:3000"],
    // origin: ["https://glowing-florentine-a3c179.netlify.app"],
    // methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User joined room ', room);
  });

  socket.on("new message",(newMsgRecieved) => {
    var chat = newMsgRecieved.chat;

    if(!chat.users) return console.log("Chat.users not defined");

    chat.users.forEach((user) => {
      if(user._id == newMsgRecieved.sender._id) return;
      socket.in(user._id).emit('message received', newMsgRecieved);
    });
  });

  socket.on("typing", (room) => {
    socket.in(room).emit('typing');
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.off("setup",()=>{
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });  
});

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
    // origin: ["https://glowing-florentine-a3c179.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use('/',route);
app.use(notFound);
app.use(errorHandler);