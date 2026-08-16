require("dotenv").config();

const {
  createSoilMeasurement,
} = require("../services/measurements.services");

async function test() {
  try {
    const measurement = await createSoilMeasurement(
      "poco-D2A7E4",
      42.5
    );

    console.log("Mesure enregistrée :");
    console.log(measurement);

  } catch (error) {
    console.error("Erreur :", error.message);
  }
}

test();