const webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:poco@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Envoie une notification Push à un appareil.
 *
 * @param {Object} subscription Abonnement Push du navigateur
 * @param {Object} notification Contenu de la notification
 */
async function sendPushNotification(subscription, notification) {
  const payload = JSON.stringify(notification);

  try {
    await webpush.sendNotification(subscription, payload);

    console.log("Notification Push POCO envoyée");

    return true;
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de la notification Push POCO :",
      error
    );

    throw error;
  }
}

async function savePushSubscription(
  userId,
  subscription
) {
  const supabaseAdmin =
    require("../config/supabaseAdmin");

  const subscriptionData =
    subscription.keys;

  if (
    !userId ||
    !subscription.endpoint ||
    !subscriptionData?.p256dh ||
    !subscriptionData?.auth
  ) {
    throw new Error(
      "Abonnement Push invalide"
    );
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscriptionData.p256dh,
        auth: subscriptionData.auth,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "endpoint",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Impossible d'enregistrer l'abonnement Push : ${error.message}`
    );
  }

  return data;
}

module.exports = {
  sendPushNotification,
  savePushSubscription,
};