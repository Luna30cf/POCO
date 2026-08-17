const express = require("express");
require("dotenv").config();

const websiteRoutes = require("./routes/website.routes");
const potsRoutes = require("./routes/pots.routes");
const measurementsRoutes = require("./routes/measurements.routes");
const commandsRoutes = require("./routes/commands.routes");
const { startMqttClient } = require("./services/mqtt.services");


const app = express();

app.use(express.json());

app.use(express.static("assets"));

app.use("/", websiteRoutes);
app.use("/api/pots", potsRoutes);
app.use("/api/pots", commandsRoutes);
app.use("/api/measurements", measurementsRoutes);

startMqttClient();
module.exports = app;