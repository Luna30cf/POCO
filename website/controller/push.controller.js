const {
  savePushSubscription,
  sendPushNotification,
} = require("../services/push.services");

const supabaseAdmin =
  require("../config/supabaseAdmin");


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

async function testPushController(req, res) {
  try {
    const {
      data: subscriptions,
      error,
    } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", req.user.id);

    if (error) {
      throw error;
    }

    if (
      !subscriptions ||
      subscriptions.length === 0
    ) {
      return res.status(404).json({
        error:
          "Aucun appareil abonné aux notifications",
      });
    }

    for (const subscription of subscriptions) {
      await sendPushNotification(
        {
          endpoint: subscription.endpoint,

          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        {
          title: "💧 Réservoir insuffisant",
          body:
            "Remplissez le réservoir de votre POCO pour permettre l'arrosage.",
          url: "/mes-plantes",
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Notification envoyée",
    });

  } catch (error) {
    console.error(
      "Erreur test Push :",
      error
    );

    return res.status(500).json({
      error:
        "Impossible d'envoyer la notification",
    });
  }
}

module.exports = {
  subscribePushController,
  testPushController,
};