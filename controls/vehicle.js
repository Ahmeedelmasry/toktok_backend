const VehicleSchema = require("../models/vehicle.js");
const path = require("path");
const { uploadFile, delFile } = require("../middlewares/uploadFile.js");

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
const createItem = async (req, res) => {
  let filepath;
  try {
    const body = {
      ...req.body,
      createdAt: new Date(),
    };

    if (req.files && req.files.file) {
      filepath = await uploadFile(req, res, "vehicla_images");
      body.image = `${process.env.SERVER_DOMAIN}/${filepath}`;
    }
    const getLastRecord = await VehicleSchema.find({}).sort({ order: -1 });


    const set = await VehicleSchema.create({
      ...body,
      createdAt: new Date(),
      order: getLastRecord[0] ? getLastRecord[0].order + 1 : 1,
    });
    await set.save();

    return res.status(200).json({ message: "Vehicle Created Successfully" });
  } catch (error) {
    console.log(error);
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

const updateItem = async (req, res) => {
  try {
    let item = await VehicleSchema.findOne({ _id: req.params.id });
    //Hash The Password
    if (!item) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    const body = {
      ...req.body,
    };

    // Check If there is an image file uploaded
    let filepath;

    if (req.files && req.files.file) {
      filepath = await uploadFile(req, res, "vehicla_images");
      body.image = `${process.env.SERVER_DOMAIN}/${filepath}`;
    }

    await VehicleSchema.updateOne({ _id: req.params.id }, body);

    const VehicleData = {
      _id: req.params.id,
      ...body,
    };

    return res.status(200).json({ message: "Vehicle updated successfully" });
  } catch (error) {
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    await VehicleSchema.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Vehicle Deleted Successfully" });
  } catch (error) {
    res.status(404).json({ message: "Vehicle not found" });
  }
};

// Get Vehicle
const getItem = async (req, res) => {
  try {
    const result = await VehicleSchema.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: "Vehicle not found" });
  }
};

// Get Vehicle
const getItems = async (req, res) => {
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
      select: `name image isActive createdAt order`,
      sort: { order: 1 },
    };

    const result = await VehicleSchema.paginate(query, options);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

const sortItem = async (req, res) => {
  try {
    // Find the current record
    const currentRecord = await VehicleSchema.findOne({ _id: req.params.id });
    if (!currentRecord) {
      return res.status(404).json({ message: "Category not found" });
    }

    const aboveRecord = await VehicleSchema.findOne({
      order:
        Number(req.params.order_type) > 0
          ? { $gt: Number(currentRecord.order) }
          : { $lt: Number(currentRecord.order) },
    }).sort({ order: Number(req.params.order_type) > 0 ? 1 : -1 });

    if (!aboveRecord) {
      return res.status(400).json({ message: "Can not reorder item" });
    }

    // Swap the `order` values of the two records
    await VehicleSchema.updateOne(
      { _id: currentRecord._id },
      { $set: { order: aboveRecord.order } },
    );

    await VehicleSchema.updateOne(
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
  createItem,
  getItem,
  getItems,
  updateItem,
  deleteItem,
  sortItem,
};
