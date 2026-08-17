const {
  getPlantDecision,
} = require("../services/decisions.services");


async function getDecisionController(req, res) {
  try {
    const potId = req.params.potId;

    const decision = await getPlantDecision(
      req.supabase,
      potId
    );

    return res.status(200).json(decision);

  } catch (error) {
    console.error(
      "Erreur moteur de décision :",
      error.message
    );

    if (
      error.message ===
      "Plante introuvable ou accès non autorisé"
    ) {
      return res.status(403).json({
        error:
          "Plante introuvable ou accès non autorisé",
      });
    }

    return res.status(500).json({
      error:
        "Impossible d'évaluer l'état de la plante",
    });
  }
}


module.exports = {
  getDecisionController,
};
