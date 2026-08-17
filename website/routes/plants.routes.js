const express = require("express");

const {
  assignSpeciesController,
  getPlantController,
} = require("../controller/plants.controller");

const {
  authenticateUser,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/:potId/species",
  authenticateUser,
  assignSpeciesController,
);

router.get(
  "/:potId/plant",
  authenticateUser,
  getPlantController,
);

module.exports = router;