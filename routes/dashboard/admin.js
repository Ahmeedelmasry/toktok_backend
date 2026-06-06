const express = require("express");
const router = express.Router();
const {
  createAdmin,
  getAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
  sortItem,
} = require("../../controls/dashboard/admin.js");
const fileUpload = require("express-fileupload");
const { verifyToken } = require("../../middlewares/adminCheckAuth.js");

router.post(
  "/",
  verifyToken,
  fileUpload({ createParentPath: true }),
  createAdmin,
);
router.get("/", verifyToken, getAdmins);
router.get("/:id", verifyToken, getAdmin);
router.put(
  "/:id",
  verifyToken,
  fileUpload({ createParentPath: true }),
  updateAdmin,
);
router.delete("/:id", verifyToken, deleteAdmin);

module.exports = router;
