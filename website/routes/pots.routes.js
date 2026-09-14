const express = require("express");

const {
  getPots,
  associatePot,
  startProvisioning,
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

router.post(
  "/:potId/provisioning",
  authenticateUser,
  startProvisioning
);

module.exports = router;