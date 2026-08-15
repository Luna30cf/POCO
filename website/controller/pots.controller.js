const { getUserPots } = require("../services/pots.services");

async function getPots(req, res) {
  try {
    const pots = await getUserPots(req.supabase);

    res.status(200).json(pots);
  } catch (error) {
    console.error("Erreur récupération des pots :", error);

    res.status(500).json({
      error: "Impossible de récupérer les pots",
    });
  }
}

module.exports = {
  getPots,
};