const express = require("express");
const {
  getLatestPotMeasurement,
} = require("../controller/measurements.controller");

const {
  authenticateUser,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/:potId/latest",
  authenticateUser,
  getLatestPotMeasurement
);

module.exports = router;