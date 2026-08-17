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

    return res.status(200).json(result);

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


    if (
      error.message ===
      "Niveau d'eau insuffisant"
    ) {
      return res.status(409).json({
        error:
          "Arrosage impossible : niveau d'eau insuffisant",
      });
    }


    if (
      error.message ===
      "Niveau d'eau inconnu"
    ) {
      return res.status(409).json({
        error:
          "Arrosage impossible : niveau d'eau inconnu",
      });
    }


    if (
      error.message ===
      "Impossible de vérifier le niveau d'eau"
    ) {
      return res.status(500).json({
        error:
          "Impossible de vérifier le niveau d'eau",
      });
    }


    return res.status(500).json({
      error:
        "Impossible d'envoyer la commande d'arrosage",
    });
  }
}


module.exports = {
  waterPotController,
};