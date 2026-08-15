const express = require("express");
const { getPots } = require("../controller/pots.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticateUser, getPots);

module.exports = router;