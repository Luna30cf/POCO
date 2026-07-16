const express = require("express");
const path = require("path");

const app = express();

// Permet de servir CSS / JS / images
app.use(express.static(path.join(__dirname, "assets")));

// Routes
const websiteRoutes = require("./routes/website.routes");
app.use("/", websiteRoutes);

module.exports = app;