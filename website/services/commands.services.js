const {
  publishMqttMessage,
} = require("./mqtt.services");


async function waterPot(supabase, potId) {

  // 1. Vérifie que le pot est accessible
  // par l'utilisateur connecté via la RLS
  const { data: pot, error: potError } = await supabase
    .from("pots")
    .select("id, name, mac_address")
    .eq("id", potId)
    .single();


  if (potError || !pot) {
    throw new Error(
      "Pot introuvable ou accès non autorisé"
    );
  }


  // 2. Récupère la dernière situation connue du pot
  const {
    data: measurement,
    error: measurementError,
  } = await supabase
    .from("measurements")
    .select("water_level, measured_at")
    .eq("pot_id", pot.id)
    .order("measured_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();


  if (measurementError) {
    throw new Error(
      "Impossible de vérifier le niveau d'eau"
    );
  }


  if (!measurement) {
    throw new Error(
      "Niveau d'eau inconnu"
    );
  }


  // 3. Sécurité anti-marche-à-sec côté backend
  if (measurement.water_level !== true) {
    throw new Error(
      "Niveau d'eau insuffisant"
    );
  }


  // 4. Construction du device_id
  // poco-D2A7E4 → D2A7E4
  const deviceId = pot.name.replace(
    "poco-",
    ""
  );


  const topic =
    `poco/${deviceId}/pump`;


  const payload = {
    action: "water",
  };


  // 5. Publication uniquement si eau disponible
  await publishMqttMessage(
    topic,
    payload
  );


  return {
    success: true,
    pot_id: pot.id,
    device_id: deviceId,
    topic,
  };
}

async function setLedState(
  supabase,
  potId,
  action
) {
  const { data: pot, error } = await supabase
    .from("pots")
    .select("id, name")
    .eq("id", potId)
    .single();

  if (error || !pot) {
    throw new Error(
      "Pot introuvable ou accès non autorisé"
    );
  }

  if (
    action !== "on" &&
    action !== "off"
  ) {
    throw new Error(
      "Commande LED invalide"
    );
  }

  const deviceId =
    pot.name.replace("poco-", "");

  const topic =
    `poco/${deviceId}/led`;

  await publishMqttMessage(
    topic,
    {
      action: action,
    }
  );

  return {
    success: true,
    action,
    device_id: deviceId,
  };
}


module.exports = {
  waterPot,
  setLedState,
};