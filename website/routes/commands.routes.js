const express = require("express");

const {
  waterPotController,
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

module.exports = router;