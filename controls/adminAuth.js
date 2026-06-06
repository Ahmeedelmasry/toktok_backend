const AdminSchema = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const maxAge = 60 * 60 * 24;

//Generating Token
const generToken = (data) => {
  return jwt.sign({ data }, "Above App", {
    expiresIn: maxAge,
  });
};

const doLogin = async (req, res) => {
  console.log("Before Try");
  try {
    const { email, password } = req.body;
    const admin = await AdminSchema.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const compare = await bcrypt.compare(password, admin.password);
    if (!compare) {
      return res.status(415).json({ message: "Invalid email or password" });
    }

    const cookie = generToken({
      userName: admin.userName,
      email: admin.email,
      anotherEmail: admin.anotherEmail,
      isAdmin: admin.isAdmin,
      createdAt: admin.createdAt,
      _id: admin._id,
    });

    return res.status(200).json({ token: cookie });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
  console.log("After Try");
};

module.exports = {
  doLogin,
  generToken,
};
