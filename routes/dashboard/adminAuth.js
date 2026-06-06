const express = require("express");
const router = express.Router();
const { doLogin } = require("../../controls/dashboard/adminAuth");
const { validate } = require("../../middlewares/validateLogin");

router.post("/admin-login", validate, doLogin);

module.exports = router;
