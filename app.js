// Import required modules
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const NodeCache = require('node-cache');
// Create a new instance of NodeCache
const cache = new NodeCache();

const {
  customer,
  deliveryPartner,
  restaurant,
  menu,
} = require("./model/userSchema");


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
// Map to store connected users and their sockets
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

app.post("/cache-restaurant-status", async (req, res) => {
  const { email } = req.body; // Assuming email is sent as JSON data
  console.log("cache",email)

  // Check if the email already exists in the cache
  if (cache.has(email)) {
    return res.status(200).json({ message: 'Email already exists in cache' });
  }

  // If the email does not exist, save it to the cache under the "restaurant" collection
  cache.set(`restaurant:${email}`, true); // Assuming you want to store true as the value

  res.status(200).json({ message: 'Email saved in cache' });
});
// Route to check if the restaurant status is active
app.get("/checkRestaurantActiveStatus", async (req, res) => {
  const { email } = req.query;

  // Check if the email exists in the cache
  if (cache.has(`restaurant:${email}`)) {
    // Emit a socket event with the email
    io.emit("restaurantStatus", { email });
    console.log("Emitting restaurantStatus");

    // Set up a timer to wait for a response (adjust the timeout as needed)
    const timeout = 5000; // 5 seconds timeout
    let responseReceived = false;

    // Set up a timeout to handle cases where no response is received
    const timer = setTimeout(() => {
      if (!responseReceived) {
        console.log("No response received within the timeout");
        return res.status(500).json({ message: 'No response received within the timeout' });
      }
    }, timeout);

    // Listen for the response from clients
    io.on("restaurantStatusResponse", (response) => {
      console.log("Received restaurantStatusResponse:", response);
      // Handle the response from the client here
      responseReceived = true;
      clearTimeout(timer); // Clear the timeout
      return res.status(200).json({ message: 'Response received successfully' });
    });
  } else {
    // If the email is not found in the cache, send a response indicating that the email is not found
    return res.status(404).json({ message: 'Email not found in cache' });
  }
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

    // Check server cache memory for restaurant emails
    const cachedEmails = cache.keys().filter(key => key.startsWith('restaurant:')).map(key => key.substring(11));

    console.log("Emails found in cache:", cachedEmails);

    menuItems.forEach(item => {
      item.activeStatus = cachedEmails.includes(item.email) ? "online" : "offline";
      if (cachedEmails.includes(item.email)) {
        console.log(`Email ${item.email} found in cache and matched with menu item.`);
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
