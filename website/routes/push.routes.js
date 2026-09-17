const express = require("express");

const {
  subscribePushController,
  testPushController,
} = require("../controller/push.controller");

const {
  authenticateUser,
} = require("../middlewares/auth.middleware");

const router = express.Router();


router.post(
  "/subscribe",
  authenticateUser,
  subscribePushController,
  testPushController
);


module.exports = router;