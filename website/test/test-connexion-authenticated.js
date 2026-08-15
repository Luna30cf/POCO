const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthenticatedUser() {
    const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
            email: process.env.TEST_USER2_EMAIL,
            password: process.env.TEST_USER2_PASSWORD,
        });

    if (authError) {
        console.error("Erreur connexion utilisateur :", authError.message);
        return;
    }

    console.log("Utilisateur connecté :", authData.user.email);

    const { data: pots, error: potsError } = await supabase
        .from("pots")
        .select("id, name, user_id, mac_address");

    if (potsError) {
        console.error("Erreur récupération pots :", potsError.message);
        return;
    }

    console.log("Pots accessibles :");
    console.log(pots);
}

testAuthenticatedUser();