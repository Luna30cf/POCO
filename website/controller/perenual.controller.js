const {
  searchSpecies,
} = require("../services/perenual.services");


async function searchSpeciesController(req, res) {
  try {
    const query = req.query.q;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: "Recherche invalide",
      });
    }

    const results = await searchSpecies(query);

    return res.status(200).json(results);

  } catch (error) {
    console.error(
      "Erreur recherche Perenual :",
      error.message
    );

    return res.status(500).json({
      error:
        "Impossible de rechercher les espèces",
    });
  }
}


module.exports = {
  searchSpeciesController,
};