const {
  waterPot,
} = require("../services/commands.services");


async function waterPotController(req, res) {
  try {
    const potId = req.params.potId;

    const result = await waterPot(
      req.supabase,
      potId
    );

    res.status(200).json(result);

  } catch (error) {
    console.error(
      "Erreur commande arrosage :",
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

    res.status(500).json({
      error:
        "Impossible d'envoyer la commande d'arrosage",
    });
  }
}


module.exports = {
  waterPotController,
};