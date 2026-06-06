const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const VehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter vehicle name"],
  },

  image: {
    type: String,
    required: [true, "Please upload vehicle image"],
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

VehicleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("vehicle", VehicleSchema);
