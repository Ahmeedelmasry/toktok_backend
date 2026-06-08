const express = require("express");
const router = express.Router();
const {
  createItem,
  getItem,
  getItems,
  updateItem,
  deleteItem,
  sortItem,
} = require("../../controls/dashboard/vehicle.js");
const fileUpload = require("express-fileupload");
const { verifyToken } = require("../../middlewares/adminCheckAuth.js");

router.post(
  "/",
  verifyToken,
  fileUpload({ createParentPath: true }),
  createItem,
);
router.get("/", getItems);
router.get("/:id", getItem);
router.put(
  "/:id",
  verifyToken,
  fileUpload({ createParentPath: true }),
  updateItem,
);
router.delete("/:id", verifyToken, deleteItem);

module.exports = router;
