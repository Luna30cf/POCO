const express = require("express");
const path = require("path");

const router = express.Router();

// Page d'accueil
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../templates/index.html"));
});

// Dashboard
router.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../templates/dashboard.html"));
});

//Login
router.get("/login", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../templates/login.html")
  );
});

module.exports = router;