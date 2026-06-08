const mongoose = require("mongoose");
const { isEmail } = require("validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const AddressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter address name"],
  },

  address: {
    type: String,
    required: [true, "Please enter address"],
  },

  lng: {
    type: Number,
    required: [true, "Please select map location"],
  },

  lat: {
    type: Number,
    required: [true, "Please select map location"],
  },

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "client",
  },

  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
  },

  isActive: {
    type: Boolean,
    required: [true, "Please enter user active status"],
    default: true,
  },

  order: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: String,
    default: "",
  },
});

AddressSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("addresses", AddressSchema);
