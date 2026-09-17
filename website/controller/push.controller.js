const {
  savePushSubscription,
} = require("../services/push.services");


async function subscribePushController(req, res) {
  try {
    const subscription = req.body;

    if (
      !subscription ||
      !subscription.endpoint ||
      !subscription.keys
    ) {
      return res.status(400).json({
        error: "Abonnement Push invalide",
      });
    }

    const savedSubscription =
      await savePushSubscription(
        req.user.id,
        subscription
      );

    return res.status(201).json({
      success: true,
      subscriptionId:
        savedSubscription.id,
    });

  } catch (error) {
    console.error(
      "Erreur abonnement Push :",
      error.message
    );

    return res.status(500).json({
      error:
        "Impossible d'enregistrer les notifications",
    });
  }
}


module.exports = {
  subscribePushController,
};