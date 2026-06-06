const express = require("express");
const router = express.Router();
const {
  createItem,
  getItem,
  getItems,
  updateItem,
  deleteItem,
  sortItem,
} = require("../../controls/dashboard/driver.js");
const fileUpload = require("express-fileupload");
const { verifyToken } = require("../../middlewares/adminCheckAuth.js");

router.post(
  "/",
  verifyToken,
  fileUpload({ createParentPath: true }),
  createItem,
);
router.get("/", verifyToken, getItems);
router.get("/:id", verifyToken, getItem);
router.put(
  "/:id",
  verifyToken,
  fileUpload({ createParentPath: true }),
  updateItem,
);
router.delete("/:id", verifyToken, deleteItem);

module.exports = router;
