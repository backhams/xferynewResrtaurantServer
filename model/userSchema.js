
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


const customer = mongoose.model("Customer", customerSchema);
const deliveryPartner = mongoose.model("DeliveryPartner", deliverySchema);
const restaurant = mongoose.model("Restaurant", restaurantSchema);
module.exports = { customer,deliveryPartner,restaurant };