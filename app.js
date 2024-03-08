// Import required modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const NodeCache = require('node-cache');
const { v4: uuidv4 } = require('uuid');

// Create a new instance of NodeCache
const cache = new NodeCache();

const {
  customer,
  deliveryPartner,
  restaurant,
  menu,
} = require("./model/userSchema");
const { Console } = require("console");

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

// Define a connection event handler
io.on("connection", (socket) => {
  console.log("A client connected.");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A client disconnected.");
    // Remove the data associated with the disconnected socket from connectedData
    delete connectedData[socket.id];
  });

  // Handle data sent during connection
  socket.on("connectData", (data) => {
    console.log("Data sent during connection:", data);
    
    // Check if the email already exists in connectedData
    const existingSocketId = Object.keys(connectedData).find(
      (socketId) => connectedData[socketId].email === data.email
    );

    if (existingSocketId) {
      console.log(`Replacing existing connection for email: ${data.email}`);
      // Remove existing connection
      delete connectedData[existingSocketId];
    }

    // Store the data in the connectedData object
    connectedData[socket.id] = data;
  });
});


// Object to store data sent during connection
let connectedData = {};

app.get("/getsocket",async (req,res)=>{
  res.status(200).json(connectedData)
})
app.post("/cache-restaurant-status", async (req, res) => {
  const { email } = req.body; // Assuming email is sent as JSON data
  console.log(connectedData)

  // Check if the email already exists in the cache
  if (cache.has(email)) {
    return res.status(200).json({ message: 'Email already exists in cache' });
  }

  // If the email does not exist, save it to the cache under the "restaurant" collection
  cache.set(`restaurant:${email}`, true); // Assuming you want to store true as the value

  res.status(200).json({ message: 'Email saved in cache' });
});


app.get("/nearbySearch", async (req, res) => {
  const { page, latitude, longitude } = req.query;

  try {
    if (!page || isNaN(parseInt(page)) || !latitude || !longitude) {
      return res.status(400).json({ error: "Invalid page number or missing latitude/longitude" });
    }

    const itemsPerPage = 5;
    const skip = (parseInt(page) - 1) * itemsPerPage;

    // Convert latitude and longitude to float
    const userLatitude = parseFloat(latitude);
    const userLongitude = parseFloat(longitude);

    // Fetch documents from the database based on geospatial query
    const menuItems = await menu.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [userLongitude, userLatitude]
          },
          $maxDistance: 3000 // Maximum distance in meters (3 kilometers)
        }
      },
      status: "Active" // Add condition to check for "Active" status
    })
    .skip(skip)
    .limit(itemsPerPage)
    .exec();

    // Check connected data for restaurant emails
    const connectedEmails = Object.values(connectedData);

    console.log("Emails found in connectedData:", connectedEmails);

    menuItems.forEach(item => {
      item.activeStatus = connectedEmails.includes(item.email) ? "online" : "offline";
      if (connectedEmails.includes(item.email)) {
        console.log(`Email ${item.email} found in connectedData and matched with menu item.`);
      }
    });

    // Create a new array to hold the modified menu items with activeStatus included
    const modifiedMenuItems = menuItems.map(item => {
      return {
        ...item.toObject(),
        activeStatus: item.activeStatus
      };
    });

    res.json(modifiedMenuItems);
  } catch (error) {
    console.error("Something went wrong!", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/checkRestaurantActiveStatus", async (req, res) => {
  const { email } = req.query;
console.log(email)
  try {
   // Check if the email exists in the connectedData object
   const emailExists = Object.values(connectedData).some(
    (storedEmail) => storedEmail === email
  );
      
      console.log(emailExists)
    if (emailExists) {
      // If the email exists, send a 200 response
      return res.status(200).json({ message: 'Email exists in connectedData' });
    } else {
      console.log("not found")
      // If the email does not exist, send a 404 response
      return res.status(404).json({ message: 'Email does not exist in connectedData' });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// Route to remove a cached document based on email
app.delete("/remove-restaurant/:email", async (req, res) => {
  const { email } = req.params;

  // Check if the email exists in the cache
  if (cache.has(`restaurant:${email}`)) {
    // If the email exists, remove it from the cache
    cache.del(`restaurant:${email}`);
    return res.status(200).json({ message: 'Email removed from cache' });
  }

  // If the email does not exist in the cache
  return res.status(404).json({ message: 'Email not found in cache' });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`);
});
