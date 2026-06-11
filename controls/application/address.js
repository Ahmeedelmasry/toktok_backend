const AddressSchema = require("../../models/application/address.js");
const ClientSchema = require("../../models/dashboard/client.js");
const DriverSchema = require("../../models/dashboard/driver.js");

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
  try {
    const body = {
      ...req.body,
      createdAt: new Date(),
    };

    const getLastRecord = await AddressSchema.find({}).sort({ order: -1 });

    const set = await AddressSchema.create({
      ...body,
      createdAt: new Date(),
      order: getLastRecord[0] ? getLastRecord[0].order + 1 : 1,
    });
    const user = await set.save();

    return res.status(200).json({ message: "Address created successfully" });
  } catch (error) {
    console.log(error);
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

const updateItem = async (req, res) => {
  try {
    let item = await AddressSchema.findOne({ _id: req.params.id });
    //Hash The Password
    if (!item) {
      return res.status(404).json({ message: "Client not found" });
    }
    const body = {
      ...req.body,
    };

    await AddressSchema.updateOne({ _id: req.params.id }, body);

    const clientData = {
      _id: req.params.id,
      ...body,
    };

    return res.status(200).json({ message: "Address updated successfully" });
  } catch (error) {
    const errors = validatCreation(error, req.body);
    res.status(400).json({ errors: errors.errors, message: errors.message });
  }
};

// Get Client
const getItem = async (req, res) => {
  try {
    const result = await AddressSchema.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: "Client not found" });
  }
};

const getItems = async (req, res) => {
  try {
    // Check if user exists
    let driver = await DriverSchema.findById(req.params.userId);
    let client = await ClientSchema.findById(req.params.userId);

    if (!client && !driver)
      return res.status(404).json({ error: "User not found" });

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

    if (driver) {
      query.driverId = driver._id;
    } else {
      query.clientId = client._id;
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
      select: `name address lng lat clientId driverId isActive createdAt`,
    };

    const result = await AddressSchema.paginate(query, options);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error });
  }
};

const deleteItem = async (req, res) => {
  try {
    await AddressSchema.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Address not found" });
  }
};

module.exports = {
  createItem,
  getItem,
  updateItem,
  getItems,
  deleteItem,
};
