const express = require("express");

const {
  waterPotController,
  setLedController
} = require("../controller/commands.controller");

const {
  authenticateUser,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/:potId/water",
  authenticateUser,
  waterPotController
);

router.post(
  "/:potId/led",
  authenticateUser,
  setLedController
);

module.exports = router;