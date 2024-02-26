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
    console.log("sdgdg",role)
    
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
          newUser = new restaurant({ name, email });
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
  

module.exports = router;