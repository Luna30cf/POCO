const express = require("express");

const {
  subscribePushController,
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


module.exports = router;