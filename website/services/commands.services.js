const {
  publishMqttMessage,
} = require("./mqtt.services");


async function waterPot(supabase, potId) {

  // Vérifie que le pot est bien accessible
  // par l'utilisateur connecté grâce à la RLS
  const { data: pot, error } = await supabase
    .from("pots")
    .select("id, name, mac_address")
    .eq("id", potId)
    .single();


  if (error || !pot) {
    throw new Error(
      "Pot introuvable ou accès non autorisé"
    );
  }


  // Exemple :
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


module.exports = {
  waterPot,
};