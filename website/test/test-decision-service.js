const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const {
  getPlantDecision,
} = require("../services/decisions.services");


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


async function test() {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: process.env.TEST_USER1_EMAIL,
      password: process.env.TEST_USER1_PASSWORD,
    });

  if (authError) {
    console.error(
      "Erreur connexion :",
      authError.message
    );
    return;
  }


  const userSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      global: {
        headers: {
          Authorization:
            `Bearer ${authData.session.access_token}`,
        },
      },
    }
  );


  try {
    const decision =
      await getPlantDecision(
        userSupabase,
        "ed962dbd-dab5-46fe-b420-8c89ec58b33f"
      );

    console.log(
      "Décision POCO :"
    );

    console.dir(
      decision,
      { depth: null }
    );

  } catch (error) {
    console.error(
      "Erreur décision :",
      error.message
    );
  }
}


test();