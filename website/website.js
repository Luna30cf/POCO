const express = require("express");
require("dotenv").config();

const websiteRoutes = require("./routes/website.routes");
const potsRoutes = require("./routes/pots.routes");

const app = express();

app.use(express.json());

app.use(express.static("assets"));

app.use("/", websiteRoutes);
app.use("/api/pots", potsRoutes);

module.exports = app;