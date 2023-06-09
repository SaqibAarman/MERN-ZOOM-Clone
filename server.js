const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

const { v4: uuidv4 } = require("uuid");

app.use("/peerjs", peerServer);

app.set("view engine", "ejs");
app.use(express.static("Public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    // console.log(roomId, userId,'===');
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    // messaging

    socket.on("message", (message) => {
      console.log(message);
      io.to(roomId).emit("createMessage", message, userId);
    }); // Send message in the same roomId where u r
  });
});

server.listen(3030);
