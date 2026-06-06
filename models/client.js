const mongoose = require("mongoose");
const { isEmail } = require("validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter user name"],
  },

  email: {
    type: String,
    required: [true, "Please enter email address"],
    unique: true,
    validate: [isEmail, "Please enter a valid email"],
  },

  phone: {
    type: String,
    required: [true, "Please enter phone number"],
    validate: {
      validator: function (value) {
        return /^(010|011|012|015)\d{8}$/.test(value);
      },
      message:
        "Phone number must start with 010, 011, 012, or 015 and be 11 digits",
    },
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

ClientSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("client", ClientSchema);
