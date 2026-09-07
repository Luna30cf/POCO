const express = require("express");

const {
  getPots,
  associatePot,
} = require("../controller/pots.controller");

const {
  authenticateUser,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  getPots
);

router.post(
  "/associate",
  authenticateUser,
  associatePot
);

module.exports = router;