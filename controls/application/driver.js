const DriverSchema = require("../../models/dashboard/driver.js");
const path = require("path");
const bcrypt = require("bcrypt");
const { uploadFile, delFile } = require("../../middlewares/uploadFile.js");
const jwt = require("jsonwebtoken");
const { generToken } = require("../../middlewares/generateToken");

require("dotenv").config();

// Creation Validator
const validatCreation = (error, body) => {
  const errors = {};
  let mainMsg = null;

  if (error.code == 11000) {
    errors.email = "Email is already in use";
    mainMsg = "Email is already in use";
  }
  for (const val of Object.entries(error.errors ? error.errors : body)) {
    if (error.errors && error.errors[val[0]]) {
      if (!mainMsg) mainMsg = error.errors[val[0]].message;
      errors[val[0]] = error.errors[val[0]].message;
    }
  }

  return {
    errors: errors,
    message: mainMsg,
  };
};

// Create Item
const signUp = async (req, res) => {
  let filepath;
  try {
    if (!req.body.password) {
      return res.status(400).json({
        errors: { password: "Password required" },
        message: "Password required",
      });
    }

    const salt = await bcrypt.genSalt();

    //Hash The Password
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const body = {
      ...req.body,
      createdAt: new Date(),
    };

    if (req.files && req.files.file) {
      filepath = await uploadFile(req, res, "avatars");
      body.avatar = `${process.env.DOMAIN}/${filepath}`;
    }
    const getLastRecord = await DriverSchema.find({}).sort({ order: -1 });

    const set = await DriverSchema.create({
      ...body,
      createdAt: new Date(),
      order: getLastRecord[0] ? getLastRecord[0].order + 1 : 1,
    });
    const user = await set.save();

    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      _id: user._id,
    };

    const cookie = generToken(userData);

    return res.status(200).json({ token: cookie, data: userData });
  } catch (error) {
    console.log(error);
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

const doLogin = async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    let user;
    if (email) {
      user = await DriverSchema.findOne({ email });
    } else {
      user = await DriverSchema.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res.status(415).json({ message: "Invalid email or password" });
    }

    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      _id: user._id,
    };

    const cookie = generToken(userData);

    return res.status(200).json({ token: cookie, data: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
  console.log("After Try");
};

const updateItem = async (req, res) => {
  try {
    let item = await DriverSchema.findOne({ _id: req.params.id });
    //Hash The Password
    if (!item) {
      return res.status(404).json({ message: "Client not found" });
    }
    const body = {
      ...req.body,
    };
    if (body.password) {
      const salt = await bcrypt.genSalt();

      //Hash The Password
      body.password = await bcrypt.hash(body.password, salt);
    }

    // Check If there is an image file uploaded
    let filepath;

    if (req.files && req.files.file) {
      filepath = await uploadFile(req, res, "avatars");
      body.avatar = `${process.env.DOMAIN}/${filepath}`;
    }

    await DriverSchema.updateOne({ _id: req.params.id }, body);

    const clientData = {
      _id: req.params.id,
      ...body,
    };

    const userData = {
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      isActive: clientData.isActive,
      createdAt: clientData.createdAt,
      _id: clientData._id,
    };

    const cookie = generToken(userData);

    return res.status(200).json({
      message: "Driver updated successfully",
      token: cookie,
      data: userData,
    });
  } catch (error) {
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

// Get Client
const getItem = async (req, res) => {
  try {
    const result = await DriverSchema.findById(req.params.id).select(
      "-password -__v",
    );
    if (!result) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: "Client not found" });
  }
};

module.exports = {
  signUp,
  getItem,
  updateItem,
  doLogin,
};
