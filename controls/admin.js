const AdminSchema = require("../models/admin.js");
const path = require("path");
const bcrypt = require("bcrypt");
const { uploadFile, delFile } = require("../middlewares/uploadFile.js");

require("dotenv").config();
const { generToken } = require("./adminAuth.js");

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

// Create Admin
const createAdmin = async (req, res) => {
  let filepath;
  try {
    const salt = await bcrypt.genSalt();
    //Hash The Password
    const mailBody = { ...req.body };
    req.body.password = await bcrypt.hash(req.body.password, salt);
    const body = {
      ...req.body,
      createdAt: new Date(),
    };

    if (req.files && req.files.file) {
      filepath = await uploadFile(req, res, "avatars");
      body.avatar = `${process.env.DOMAIN}/${filepath}`;
    }
    const getLastRecord = await AdminSchema.find({}).sort({ order: -1 });

    const set = await AdminSchema.create({
      ...body,
      createdAt: new Date(),
      order: getLastRecord[0] ? getLastRecord[0].order + 1 : 1,
    });
    await set.save();

    return res.status(200).json({ message: "Admin Created Successfully" });
  } catch (error) {
    console.log(error);
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    let admin = await AdminSchema.findOne({ _id: req.params.id });
    //Hash The Password
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
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

    await AdminSchema.updateOne({ _id: req.params.id }, body);

    const adminData = {
      _id: req.params.id,
      ...body,
    };

    const cookie = generToken(adminData);

    return res
      .status(200)
      .json({ token: cookie, message: "Admin updated successfully" });
  } catch (error) {
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    await AdminSchema.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Admin Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "Admin not found" });
  }
};

// Get Admin
const getAdmin = async (req, res) => {
  try {
    const result = await AdminSchema.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: "Admin not found" });
  }
};

// Get Admin
const getAdmins = async (req, res) => {
  try {
    let query = {};

    const { searchWord, page = 1, limit = 10 } = req.query;

    if (searchWord) {
      query = {
        $or: [
          {
            userName: {
              $regex: searchWord.replaceAll("\\", ""),
              $options: "i",
            },
          },
          { email: { $regex: searchWord.replaceAll("\\", ""), $options: "i" } },
        ],
      };
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
      select: `userName email isActive createdAt order`,
      sort: { order: 1 },
    };

    const result = await AdminSchema.paginate(query, options);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

const getClients = async (req, res) => {
  try {
    let query = {};

    const { searchWord, page = 1, limit = 10 } = req.query;

    if (searchWord) {
      query = {
        $or: [
          { userName: { $regex: searchWord, $options: "i" } },
          { email: { $regex: searchWord, $options: "i" } },
        ],
      };
    }

    query.isAdmin = false;

    const options = {
      page: Number(page),
      limit: Number(limit),
      select: `userName email isActive isAdmin createdAt`,
    };

    const result = await AdminSchema.paginate(query, options);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

const sortItem = async (req, res) => {
  try {
    // Find the current record
    const currentRecord = await AdminSchema.findOne({ _id: req.params.id });
    if (!currentRecord) {
      return res.status(404).json({ message: "Category not found" });
    }

    const aboveRecord = await AdminSchema.findOne({
      order:
        Number(req.params.order_type) > 0
          ? { $gt: Number(currentRecord.order) }
          : { $lt: Number(currentRecord.order) },
    }).sort({ order: Number(req.params.order_type) > 0 ? 1 : -1 });

    if (!aboveRecord) {
      return res.status(400).json({ message: "Can not reorder item" });
    }

    // Swap the `order` values of the two records
    await AdminSchema.updateOne(
      { _id: currentRecord._id },
      { $set: { order: aboveRecord.order } },
    );

    await AdminSchema.updateOne(
      { _id: aboveRecord._id },
      { $set: { order: currentRecord.order } },
    );

    return res.status(200).json({ message: "Items reordered successfully" });
  } catch (error) {
    console.error("Error moving record up:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createAdmin,
  getAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  getClients,
  sortItem,
};
