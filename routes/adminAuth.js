const express = require("express");
const router = express.Router();
const { doLogin } = require("../controls/adminAuth");
const { validate } = require("../middlewares/validateLogin");

router.post("/admin-login", validate, doLogin);

module.exports = router;
