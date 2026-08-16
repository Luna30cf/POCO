const mqtt = require("mqtt");
const { createSoilMeasurement } = require("./measurements.services");

const brokerUrl = process.env.MQTT_BROKER;
const topic = process.env.MQTT_TOPIC;

function startMqttClient() {
  const client = mqtt.connect(brokerUrl);

  client.on("connect", () => {
    console.log("MQTT : connecté au broker");

    client.subscribe(topic, (error) => {
      if (error) {
        console.error("MQTT : erreur abonnement :", error.message);
        return;
      }

      console.log("MQTT : abonné au topic", topic);
    });
  });

  client.on("message", async (receivedTopic, message) => {
    try {
      const payload = JSON.parse(message.toString());

      console.log("MQTT : message reçu");
      console.log("Topic :", receivedTopic);
      console.log("Payload :", payload);

      // Vérification du topic
      const topicParts = receivedTopic.split("/");

      if (
        topicParts.length !== 3 ||
        topicParts[0] !== "poco" ||
        topicParts[2] !== "soil_sensor"
      ) {
        console.error("MQTT : topic invalide");
        return;
      }

      const topicDeviceId = topicParts[1];
      const expectedDeviceId = topicDeviceId;

      // Vérification du device_id
      if (
        typeof payload.device_id !== "string" ||
        payload.device_id !== expectedDeviceId
      ) {
        console.error(
          `MQTT : incohérence device_id (${payload.device_id}) / topic (${receivedTopic})`
        );
        return;
      }

      // Vérification de la valeur brute
      if (
        typeof payload.humidity_raw !== "number" ||
        payload.humidity_raw < 0
      ) {
        console.error("MQTT : humidity_raw invalide");
        return;
      }

      // Vérification du pourcentage
      if (
        typeof payload.humidity_percent !== "number" ||
        payload.humidity_percent < 0 ||
        payload.humidity_percent > 100
      ) {
        console.error("MQTT : humidity_percent invalide");
        return;
      }

      console.log(
        `MQTT : mesure valide - ${payload.device_id} - ${payload.humidity_percent}%`
      );

      // Enregistrement en BDD
      const measurement = await createSoilMeasurement(
        payload.device_id,
        payload.humidity_percent
      );

      console.log("BDD : mesure enregistrée");
      console.log(measurement);

    } catch (error) {
      console.error("MQTT : erreur traitement :", error.message);
    }
  });

  client.on("error", (error) => {
    console.error("MQTT : erreur :", error.message);
  });

  client.on("offline", () => {
    console.log("MQTT : client hors ligne");
  });

  client.on("reconnect", () => {
    console.log("MQTT : tentative de reconnexion...");
  });

  return client;
}

module.exports = {
  startMqttClient,
};