const supabase = require("../config/supabase");

async function testConnection() {
    const { data, error } = await supabase
        .from("species")
        .select("id, common_name")
        .limit(1);

    if (error) {
        console.error("Erreur Supabase :", error);
        return;
    }

    console.log("Connexion Supabase OK");
    console.log(data);
}

testConnection();