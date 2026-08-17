const express = require("express");

const {
  getDecisionController,
} = require("../controller/decisions.controller");

const {
  authenticateUser,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/:potId/decision",
  authenticateUser,
  getDecisionController
);

module.exports = router;