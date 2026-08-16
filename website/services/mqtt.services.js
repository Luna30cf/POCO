const mqtt = require("mqtt");

const {
  createMeasurementSnapshot,
} = require("./measurements.services");

const brokerUrl = process.env.MQTT_BROKER;

// Écoute les 3 types de capteurs POCO
const topic = "poco/+/+";

const ALLOWED_SENSORS = [
  "soil_sensor",
  "light_sensor",
  "float_sensor",
];

// File d'attente pour éviter que plusieurs messages MQTT
// modifient la BDD en même temps
let processingQueue = Promise.resolve();


async function processMqttMessage(receivedTopic, message) {
  // -----------------------------
  // 1. Analyse du topic
  // -----------------------------
  const topicParts = receivedTopic.split("/");

  if (topicParts.length !== 3) {
    console.error("MQTT : structure de topic invalide");
    return;
  }

  const [prefix, topicDeviceId, sensorType] = topicParts;

  if (prefix !== "poco") {
    console.error("MQTT : préfixe de topic invalide");
    return;
  }

  if (!ALLOWED_SENSORS.includes(sensorType)) {
    console.error(
      `MQTT : type de capteur inconnu : ${sensorType}`
    );
    return;
  }


  // -----------------------------
  // 2. Parsing du payload JSON
  // -----------------------------
  let payload;

  try {
    payload = JSON.parse(message.toString());
  } catch {
    console.error("MQTT : payload JSON invalide");
    return;
  }

  console.log("\nMQTT : message reçu");
  console.log("Topic :", receivedTopic);
  console.log("Payload :", payload);


  // -----------------------------
  // 3. Vérification du device_id
  // -----------------------------
  if (
    typeof payload.device_id !== "string" ||
    payload.device_id !== topicDeviceId
  ) {
    console.error(
      `MQTT : incohérence device_id (${payload.device_id}) / topic (${topicDeviceId})`
    );
    return;
  }


  // -----------------------------
  // 4. Validation selon le capteur
  // -----------------------------
  let measurementValues;


  // Humidité du sol
  if (sensorType === "soil_sensor") {
    if (
      typeof payload.humidity_percent !== "number" ||
      payload.humidity_percent < 0 ||
      payload.humidity_percent > 100
    ) {
      console.error(
        "MQTT : humidity_percent invalide"
      );
      return;
    }

    measurementValues = {
      soil_moisture: payload.humidity_percent,
    };
  }


  // Luminosité
  else if (sensorType === "light_sensor") {
    if (
      typeof payload.light_lux !== "number" ||
      payload.light_lux < 0
    ) {
      console.error(
        "MQTT : light_lux invalide"
      );
      return;
    }

    measurementValues = {
      light_lux: payload.light_lux,
    };
  }


  // Niveau d'eau
  else if (sensorType === "float_sensor") {
    if (
      payload.water_level !== 0 &&
      payload.water_level !== 1
    ) {
      console.error(
        "MQTT : water_level invalide"
      );
      return;
    }

    measurementValues = {
      water_level: payload.water_level === 1,
    };
  }


  // -----------------------------
  // 5. Enregistrement PostgreSQL
  // -----------------------------
  const measurement =
    await createMeasurementSnapshot(
      payload.device_id,
      measurementValues
    );


  console.log(
    `MQTT : ${sensorType} valide`
  );

  console.log(
    "BDD : snapshot enregistré"
  );

  console.log({
    soil_moisture:
      measurement.soil_moisture,

    light_lux:
      measurement.light_lux,

    water_level:
      measurement.water_level,
  });
}


function startMqttClient() {
  const client = mqtt.connect(brokerUrl);


  client.on("connect", () => {
    console.log("MQTT : connecté au broker");

    client.subscribe(topic, (error) => {
      if (error) {
        console.error(
          "MQTT : erreur abonnement :",
          error.message
        );
        return;
      }

      console.log(
        "MQTT : abonné au topic",
        topic
      );
    });
  });


  // Les messages sont mis en file d'attente
  // afin d'être traités l'un après l'autre
  client.on("message", (receivedTopic, message) => {
    processingQueue = processingQueue
      .then(() =>
        processMqttMessage(
          receivedTopic,
          message
        )
      )
      .catch((error) => {
        console.error(
          "MQTT : erreur traitement :",
          error.message
        );
      });
  });


  client.on("error", (error) => {
    console.error(
      "MQTT : erreur :",
      error.message
    );
  });


  client.on("offline", () => {
    console.log(
      "MQTT : client hors ligne"
    );
  });


  client.on("reconnect", () => {
    console.log(
      "MQTT : tentative de reconnexion..."
    );
  });


  return client;
}


module.exports = {
  startMqttClient,
};