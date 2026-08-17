const {
  assignSpeciesToPot,
  getPlantByPot,
} = require("../services/plants.services");


async function assignSpeciesController(req, res) {
  try {
    const potId = req.params.potId;

    const {
      speciesId,
      nickname,
    } = req.body;

    if (!speciesId) {
      return res.status(400).json({
        error: "speciesId manquant",
      });
    }

    const plant = await assignSpeciesToPot(
      req.supabase,
      potId,
      speciesId,
      nickname
    );

    return res.status(200).json(plant);

  } catch (error) {
    console.error(
      "Erreur association plante :",
      error.message
    );

    if (
      error.message ===
      "Pot introuvable ou accès non autorisé"
    ) {
      return res.status(403).json({
        error:
          "Pot introuvable ou accès non autorisé",
      });
    }

    if (
      error.message ===
      "Espèce introuvable"
    ) {
      return res.status(404).json({
        error: "Espèce introuvable",
      });
    }

    return res.status(500).json({
      error:
        "Impossible d'associer la plante au pot",
    });
  }
}

async function getPlantController(req, res) {
  try {
    const potId = req.params.potId;

    const plant = await getPlantByPot(
      req.supabase,
      potId
    );

    if (!plant) {
      return res.status(404).json({
        error: "Aucune plante associée à ce pot",
      });
    }

    return res.status(200).json(plant);

  } catch (error) {
    console.error(
      "Erreur récupération plante :",
      error.message
    );

    return res.status(500).json({
      error: "Impossible de récupérer la plante",
    });
  }
}

module.exports = {
  assignSpeciesController,
  getPlantController,
};