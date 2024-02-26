// Import required modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
require("./db/conn");

// This is to parse JSON files into JavaScript objects
app.use(express.json());

// Connection of router file
app.use(require("./router/auth"));

// Create HTTP server and integrate with Express app
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server);

// Map to store connected users and their numbers
const connectedUsers = new Map();

// Define a connection event handler
io.on("connection", (socket) => {
  console.log("A client connected.");
  
  // Log the list of connected users
  console.log("Connected Users:", Array.from(connectedUsers.keys()));

  // Handle 'message' event
  socket.on("message", (data) => {
    console.log("Received message:", data);
    // Broadcast the message to all connected clients
    io.emit("message", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A client disconnected.");
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`);
});
