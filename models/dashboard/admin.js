const mongoose = require("mongoose");
const { isEmail } = require("validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const AdminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Please enter user name"],
  },
  email: {
    type: String,
    required: [true, "Please enter email address"],
    unique: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minlength: [6, "Minimum password length is 6 characters"],
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

AdminSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("admin", AdminSchema);
