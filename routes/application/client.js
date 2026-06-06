const express = require("express");
const router = express.Router();
const {
  signUp,
  getItem,
  updateItem,
  doLogin,
} = require("../../controls/application/client.js");
const fileUpload = require("express-fileupload");
const { verifyToken } = require("../../middlewares/appCheckAuth.js");

router.post("/signup", signUp);
router.post("/login", doLogin);
router.get("/:id", verifyToken, getItem);
router.put(
  "/:id",
  verifyToken,
  fileUpload({ createParentPath: true }),
  updateItem,
);

module.exports = router;
