const supabaseAdmin = require("../config/supabaseAdmin");

/**
 * Retrouve un pot à partir de son identifiant matériel.
 */
async function getPotByDeviceId(deviceId) {
  const potName = `poco-${deviceId}`;

  const { data, error } = await supabaseAdmin
    .from("pots")
    .select("id, name, mac_address")
    .eq("name", potName)
    .single();

  if (error) {
    throw new Error(
      `Impossible d'identifier le pot ${potName}: ${error.message}`
    );
  }

  return data;
}


/**
 * Enregistre une mesure d'humidité pour un pot.
 */
async function createSoilMeasurement(deviceId, humidityPercent) {
  const pot = await getPotByDeviceId(deviceId);

  const { data, error } = await supabaseAdmin
    .from("measurements")
    .insert({
      pot_id: pot.id,
      soil_moisture: humidityPercent,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Impossible d'enregistrer la mesure: ${error.message}`
    );
  }

  return data;
}

async function getLatestMeasurement(supabase, potId) {
  const { data, error } = await supabase
    .from("measurements")
    .select("id, pot_id, soil_moisture, light_lux, water_level, measured_at")
    .eq("pot_id", potId)
    .order("measured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Impossible de récupérer la dernière mesure : ${error.message}`
    );
  }

  return data;
}

module.exports = {
  getPotByDeviceId,
  createSoilMeasurement,
  getLatestMeasurement,
};