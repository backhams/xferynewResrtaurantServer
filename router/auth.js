const express = require("express");
const router = express.Router();
// const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");

dotenv.config({ path: "./config.env" });
const SECRET_KEY = process.env.SECRET_KEY;

//database connection
require("../db/conn");

const {
  customer,
  deliveryPartner,
  restaurant
} = require("../model/userSchema");

// User  registration and validation register route
router.post("/register", async (req, res) => {
    const { name, email, role } = req.body;
    console.log(email)
    const location = "not added"
    const longitude = "not set"
    const latitude = "not set"
    const status = "inactive"
    const restaurantName = "not set"
    const phoneNumber = "not set"
    
    if (!name || !email || !role) {
      return res.status(422).json("Please fill all the required fields.");
    }
  
    try {
      // Check if the email exists in any of the collections
      const existingCustomer = await customer.findOne({ email });
      const existingDeliveryPartner = await deliveryPartner.findOne({ email });
      const existingRestaurant = await restaurant.findOne({ email });
  
      if (existingCustomer) {
        // If email exists as a customer, return 201 if role matches
        if (role === 'customer') {
          return res.status(201).json("done");
        } else {
          return res.status(400).json("Email already in use as a customer.");
        }
      } else if (existingDeliveryPartner) {
        // If email exists as a delivery partner, return 201 if role matches
        if (role === 'deliveryPartner') {
          return res.status(201).json("done");
        } else {
          return res.status(400).json("Email already in use as a delivery partner.");
        }
      } else if (existingRestaurant) {
        // If email exists as a restaurant, return 201 if role matches
        if (role === 'restaurant') {
          return res.status(201).json("done");
        } else {
          return res.status(400).json("Email already in use as a restaurant.");
        }
      }
  
      // Save the new user to the appropriate collection based on the role
      let newUser;
      switch (role) {
        case 'customer':
          newUser = new customer({ name, email });
          break;
        case 'deliveryPartner':
          newUser = new deliveryPartner({ name, email });
          break;
        case 'restaurant':
          newUser = new restaurant({ name, email,status,location,latitude,longitude,restaurantName,phoneNumber });
          break;
        default:
          return res.status(422).json("Invalid role.");
      }
  
      await newUser.save();
      res.status(201).json("User registered successfully.");
    } catch (err) {
      console.error(err);
      res.status(500).json("Internal server error, please try again later.");
    }
  });
  
  router.patch("/restaurantProfileEdit", async (req, res) => {
    const { location, restaurantName, longitude, latitude, email,phoneNumber } = req.body;
    console.log(email)
    
    // Check if any required field is missing in the request body
    if (!location || !restaurantName || !longitude || !latitude || !email || !phoneNumber) {
        return res.status(400).json("Please provide all required data");
    }

    try {
        // Search for a restaurant document with the provided email
        const existingRestaurant = await restaurant.findOne({ email });

        if (!existingRestaurant) {
            console.log("Not found")
            // If no document is found, return a 404 error
            return res.status(404).json("User not found");
        } else {
            // If a document is found, update its fields with the provided data
            existingRestaurant.location = location;
            existingRestaurant.restaurantName = restaurantName;
            existingRestaurant.longitude = longitude;
            existingRestaurant.latitude = latitude;
            existingRestaurant.phoneNumber = phoneNumber;

            // Save the updated document
            await existingRestaurant.save();

            // Respond with a success message
            res.status(200).json("Restaurant updated successfully");
        }
    } catch (error) {
        // Handle any errors
        console.error("Error updating profile:");
        res.status(500).json("Internal server error");
    }
});

router.get("/restaurantProfileData", async (req, res) => {
  const { email } = req.query;
  
  // Check if any required field is missing in the request body
  if (!email) {
      return res.status(400).json("Please provide email");
  }

  try {
      // Search for a restaurant document with the provided email
      const existingRestaurant = await restaurant.findOne({ email });

      if (!existingRestaurant) {
          console.log("Not found")
          // If no document is found, return a 404 error
          return res.status(404).json("User not found");
      } else {
          // Send the restaurant document as the response
          res.status(200).json(existingRestaurant);
      }
  } catch (error) {
      // Handle any errors
      console.error("Error updating profile:", error);
      res.status(500).json("Internal server error");
  }
});

router.post("/menuUpload", async (req, res) => {
  const { email } = req.query;
  
  // Check if any required field is missing in the request body
  if (!email) {
      return res.status(400).json("Please provide email");
  }

  try {
      // Search for a restaurant document with the provided email
      const existingRestaurant = await restaurant.findOne({ email });

      if (!existingRestaurant) {
          console.log("Not found")
          // If no document is found, return a 404 error
          return res.status(404).json("User not found");
      } else {
          // Send the restaurant document as the response
          res.status(200).json(existingRestaurant);
      }
  } catch (error) {
      // Handle any errors
      console.error("Error updating profile:", error);
      res.status(500).json("Internal server error");
  }
});




module.exports = router;