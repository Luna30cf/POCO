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

module.exports = {
  sendPushNotification,
};