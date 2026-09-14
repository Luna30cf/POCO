const express = require("express");
const path = require("path");

const router = express.Router();


// PAGE DE CONNEXION
router.get("/", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "../templates/login.html"
    )
  );
});


// MES PLANTES
router.get("/mes-plantes", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "../templates/index.html"
    )
  );
});


// DASHBOARD D'UN POT
router.get("/dashboard/:potId", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "../templates/dashboard.html"
    )
  );
});


// LOGIN
router.get("/login", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "../templates/login.html"
    )
  );
});


// REGISTER
router.get("/register", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "../templates/register.html"
    )
  );
});


module.exports = router;