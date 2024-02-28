
const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const deliverySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String
  },
  location: {
    type: String
  },
  latitude: {
    type: String
  },
  longitude: {
    type: String
  },
  status: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const menuSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  url:{
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const customer = mongoose.model("Customer", customerSchema);
const deliveryPartner = mongoose.model("DeliveryPartner", deliverySchema);
const restaurant = mongoose.model("Restaurant", restaurantSchema);
const menu = mongoose.model("Menu", menuSchema);
module.exports = { customer,deliveryPartner,restaurant,menu };