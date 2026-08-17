async function assignSpeciesToPot(
  supabase,
  potId,
  speciesId,
  nickname
) {
  // 1. Vérifier que le pot appartient bien
  // à l'utilisateur connecté
  const { data: pot, error: potError } = await supabase
    .from("pots")
    .select("id")
    .eq("id", potId)
    .single();

  if (potError || !pot) {
    throw new Error(
      "Pot introuvable ou accès non autorisé"
    );
  }

  // 2. Vérifier que l'espèce existe
  const { data: species, error: speciesError } = await supabase
    .from("species")
    .select("id, common_name, scientific_name")
    .eq("id", speciesId)
    .single();

  if (speciesError || !species) {
    throw new Error("Espèce introuvable");
  }

  const plantNickname =
    nickname?.trim() || species.common_name;

  // 3. Vérifier si ce pot possède déjà une plante
  const {
    data: existingPlant,
    error: existingPlantError,
  } = await supabase
    .from("plants")
    .select("id")
    .eq("pot_id", potId)
    .maybeSingle();

  if (existingPlantError) {
    throw new Error(
      `Impossible de vérifier la plante existante : ${existingPlantError.message}`
    );
  }

  let result;

  // 4A. Plante existante → UPDATE
  if (existingPlant) {
    const { data, error } = await supabase
      .from("plants")
      .update({
        species_id: speciesId,
        nickname: plantNickname,
      })
      .eq("id", existingPlant.id)
      .select(`
        id,
        pot_id,
        nickname,
        species:species_id (
          id,
          common_name,
          scientific_name,
          image_url,
          watering,
          watering_benchmark_value,
          watering_benchmark_unit,
          sunlight,
          indoor,
          care_level,
          description
        )
      `)
      .single();

    if (error) {
      throw new Error(
        `Impossible de modifier la plante : ${error.message}`
      );
    }

    result = data;
  }

  // 4B. Pas encore de plante → INSERT
  else {
    const { data, error } = await supabase
      .from("plants")
      .insert({
        pot_id: potId,
        species_id: speciesId,
        nickname: plantNickname,
      })
      .select(`
        id,
        pot_id,
        nickname,
        species:species_id (
          id,
          common_name,
          scientific_name,
          image_url,
          watering,
          watering_benchmark_value,
          watering_benchmark_unit,
          sunlight,
          indoor,
          care_level,
          description
        )
      `)
      .single();

    if (error) {
      throw new Error(
        `Impossible de créer la plante : ${error.message}`
      );
    }

    result = data;
  }

  return result;
}

async function getPlantByPot(
  supabase,
  potId
) {
  const { data, error } = await supabase
    .from("plants")
    .select(`
      id,
      pot_id,
      nickname,
      species:species_id (
        id,
        common_name,
        scientific_name,
        image_url,
        watering,
        watering_benchmark_value,
        watering_benchmark_unit,
        sunlight,
        indoor,
        care_level,
        description
      )
    `)
    .eq("pot_id", potId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Impossible de récupérer la plante : ${error.message}`
    );
  }

  return data;
}


module.exports = {
  assignSpeciesToPot,
  getPlantByPot,
};