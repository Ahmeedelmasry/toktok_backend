const express = require("express");
const router = express.Router();
const {
  createItem,
  getItem,
  getItems,
  updateItem,
  deleteItem,
} = require("../../controls/application/address.js");
const fileUpload = require("express-fileupload");
const { verifyToken } = require("../../middlewares/appCheckAuth.js");

router.post("/", verifyToken, createItem);
router.get("/", verifyToken, getItems);
router.get("/:id", verifyToken, getItem);
router.put("/:id", verifyToken, updateItem);
router.delete("/:id", verifyToken, deleteItem);

module.exports = router;
