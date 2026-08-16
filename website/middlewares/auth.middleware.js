const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Token d'authentification manquant",
      });
    }

    const token = authHeader.split(" ")[1];

    const supabase = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: "Token invalide ou expiré",
      });
    }

    req.user = user;
    req.supabase = supabase;

    next();
  } catch (error) {
    console.error("Erreur authentification :", error);

    res.status(500).json({
      error: "Erreur lors de l'authentification",
    });
  }
}

module.exports = {
  authenticateUser,
};