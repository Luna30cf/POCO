const express = require("express");

const {
  searchSpeciesController,
} = require("../controller/perenual.controller");

const {
  authenticateUser,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/search",
  authenticateUser,
  searchSpeciesController
);

module.exports = router;