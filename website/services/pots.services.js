async function getUserPots(supabase) {
  const { data, error } = await supabase
    .from("pots")
    .select("id, name, user_id, mac_address, created_at, updated_at");

  if (error) {
    throw error;
  }

  return data;
}

module.exports = {
  getUserPots,
};