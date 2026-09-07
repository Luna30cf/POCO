const supabaseAdmin =
  require("../config/supabaseAdmin");


async function getUserPots(supabase) {

  const { data, error } = await supabase
    .from("pots")
    .select(
      "id, name, user_id, mac_address, created_at, updated_at"
    );

  if (error) {
    throw error;
  }

  return data;
}


// ======================================================
// ASSOCIATION D'UN POT À UN UTILISATEUR
// ======================================================

async function associatePotWithUser(
  deviceId,
  userId
) {

  // Le nom Bluetooth est poco-D2A7E4.
  // En base, l'adresse est 1C:C3:AB:D2:A7:E4.
  // On recherche donc le pot à partir des
  // 6 derniers caractères hexadécimaux.

  const normalizedDeviceId =
    deviceId
      .replace(/[^a-fA-F0-9]/g, "")
      .toUpperCase();


  const { data: pots, error: searchError } =
    await supabaseAdmin
      .from("pots")
      .select(
        "id, name, user_id, mac_address"
      );


  if (searchError) {
    throw searchError;
  }


  const pot =
    pots.find((candidate) => {

      const normalizedMac =
        candidate.mac_address
          .replace(/[^a-fA-F0-9]/g, "")
          .toUpperCase();

      return normalizedMac.endsWith(
        normalizedDeviceId
      );
    });


  if (!pot) {
    const error =
      new Error("Pot POCO introuvable");

    error.code = "POT_NOT_FOUND";

    throw error;
  }


  // Le pot appartient déjà à cet utilisateur.
  if (pot.user_id === userId) {
    return pot;
  }




  const { data, error: updateError } =
    await supabaseAdmin
      .from("pots")
      .update({
        user_id: userId,
      })
      .eq("id", pot.id)
      .select(
        "id, name, user_id, mac_address, created_at, updated_at"
      )
      .single();


  if (updateError) {
    throw updateError;
  }


  return data;
}


module.exports = {
  getUserPots,
  associatePotWithUser,
};