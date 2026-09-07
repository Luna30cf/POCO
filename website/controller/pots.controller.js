const {
  getUserPots,
  associatePotWithUser,
  startPotProvisioning,
} = require("../services/pots.services");


async function getPots(req, res) {
  try {
    const pots =
      await getUserPots(
        req.supabase
      );

    res.status(200).json(pots);

  } catch (error) {
    console.error(
      "Erreur récupération des pots :",
      error
    );

    res.status(500).json({
      error:
        "Impossible de récupérer les pots",
    });
  }
}


// ======================================================
// ASSOCIATION D'UN POT
// ======================================================

async function associatePot(
  req,
  res
) {
  try {

    const { deviceId } =
      req.body;


    if (!deviceId) {
      return res
        .status(400)
        .json({
          error:
            "Identifiant du pot manquant",
        });
    }


    const pot =
      await associatePotWithUser(
        deviceId,
        req.user.id
      );


    res
      .status(200)
      .json(pot);


  } catch (error) {

    console.error(
      "Erreur association du pot :",
      error
    );


    if (
      error.code ===
      "POT_NOT_FOUND"
    ) {
      return res
        .status(404)
        .json({
          error:
            "Pot POCO introuvable",
        });
    }


    if (
      error.code ===
      "POT_ALREADY_ASSOCIATED"
    ) {
      return res
        .status(409)
        .json({
          error:
            "Ce pot est déjà associé à un autre compte",
        });
    }


    res
      .status(500)
      .json({
        error:
          "Impossible d'associer le pot",
      });
  }
}

async function startProvisioning(req, res) {
  try {
    const { potId } = req.params;

    const pot = await startPotProvisioning(
      potId,
      req.user.id
    );

    res.status(200).json({
      message: "Mode Bluetooth demandé",
      pot,
    });

  } catch (error) {
    console.error(
      "Erreur démarrage provisioning :",
      error
    );

    if (error.code === "POT_NOT_FOUND") {
      return res.status(404).json({
        error: "Pot POCO introuvable",
      });
    }

    return res.status(500).json({
      error:
        "Impossible d'activer le mode Bluetooth",
    });
  }
}


module.exports = {
  getPots,
  associatePot,
  startProvisioning,
};