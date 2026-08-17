const supabaseAdmin = require("../config/supabaseAdmin");

async function searchSpecies(query) {

  if (!query || query.trim().length < 2) {
    throw new Error("Recherche invalide");
  }

  const apiKey = process.env.PERENUAL_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API Perenual manquante");
  }

  const url =
    "https://www.perenual.com/api/v2/species-list" +
    `?key=${encodeURIComponent(apiKey)}` +
    `&q=${encodeURIComponent(query.trim())}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Erreur API Perenual : ${response.status}`
    );
  }

  const result = await response.json();

  return result.data;
}

async function getSpeciesDetails(perenualId) {
  const apiKey = process.env.PERENUAL_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API Perenual manquante");
  }

  const url =
    `https://www.perenual.com/api/v2/species/details/${perenualId}` +
    `?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Erreur API Perenual : ${response.status}`
    );
  }

  return await response.json();
}


async function saveSpeciesFromPerenual(perenualId) {
  const details = await getSpeciesDetails(perenualId);

  const speciesData = {
    perenual_id: details.id,
    common_name: details.common_name,
    scientific_name: Array.isArray(details.scientific_name)
      ? details.scientific_name[0]
      : details.scientific_name,

    image_url:
      details.default_image?.regular_url ?? null,

    watering:
      details.watering ?? null,

    watering_benchmark_value:
      details.watering_general_benchmark?.value ?? null,

    watering_benchmark_unit:
      details.watering_general_benchmark?.unit ?? null,

    sunlight:
      details.sunlight ?? [],

    indoor:
      details.indoor ?? null,

    care_level:
      details.care_level ?? null,

    description:
      details.description ?? null,
  };

  const { data, error } = await supabaseAdmin
    .from("species")
    .upsert(
      speciesData,
      {
        onConflict: "perenual_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Impossible d'enregistrer l'espèce : ${error.message}`
    );
  }

  return data;
}


module.exports = {
  searchSpecies,
  getSpeciesDetails,
  saveSpeciesFromPerenual,
};