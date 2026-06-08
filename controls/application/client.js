const ClientSchema = require("../../models/dashboard/client.js");
const path = require("path");
const bcrypt = require("bcrypt");
const { uploadFile, delFile } = require("../../middlewares/uploadFile.js");
const jwt = require("jsonwebtoken");

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

//Generating Token
const maxAge = 60 * 60 * 24;

const generToken = (data) => {
  return jwt.sign({ data }, "Above App", {
    expiresIn: maxAge,
  });
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
    const getLastRecord = await ClientSchema.find({}).sort({ order: -1 });

    const set = await ClientSchema.create({
      ...body,
      createdAt: new Date(),
      order: getLastRecord[0] ? getLastRecord[0].order + 1 : 1,
    });
    const user = await set.save();

    const cookie = generToken({
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      _id: user._id,
    });

    return res.status(200).json({ token: cookie });
  } catch (error) {
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

const doLogin = async (req, res) => {
  try {
    const { email, password, phone } = req.body;
    let user;
    if (email) {
      user = await ClientSchema.findOne({ email });
    } else {
      user = await ClientSchema.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res.status(415).json({ message: "Invalid email or password" });
    }

    const cookie = generToken({
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      _id: user._id,
    });

    return res.status(200).json({ token: cookie });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
  console.log("After Try");
};

const updateItem = async (req, res) => {
  try {
    let item = await ClientSchema.findOne({ _id: req.params.id });
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

    await ClientSchema.updateOne({ _id: req.params.id }, body);

    const clientData = {
      _id: req.params.id,
      ...body,
    };

    return res.status(200).json({ message: "Client updated successfully" });
  } catch (error) {
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

// Get Client
const getItem = async (req, res) => {
  try {
    const result = await ClientSchema.findById(req.params.id);
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
