const express = require("express");
const { getPots } = require("../controller/pots.controller");
const { authenticateUser } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authenticateUser, getPots);

module.exports = router;