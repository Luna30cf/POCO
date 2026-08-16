const {
  getLatestMeasurement,
} = require("../services/measurements.services");


async function getLatestPotMeasurement(req, res) {
  try {
    const potId = req.params.potId;

    const measurement = await getLatestMeasurement(
      req.supabase,
      potId
    );

    if (!measurement) {
      return res.status(404).json({
        error: "Aucune mesure disponible pour ce pot",
      });
    }

    res.status(200).json(measurement);

  } catch (error) {
    console.error(
      "Erreur récupération dernière mesure :",
      error
    );

    res.status(500).json({
      error: "Impossible de récupérer la dernière mesure",
    });
  }
}

module.exports = {
  getLatestPotMeasurement,
};
