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
);

router.post(
  "/test",
  authenticateUser,
  testPushController
);


module.exports = router;