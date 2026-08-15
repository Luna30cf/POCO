const SUPABASE_URL = "https://kpsduenpvmyvbigcswlu.supabase.co";
const SUPABASE_KEY = "sb_publishable_X7wxQ3Rjt_hUXPU2YPkPqA_jUvBsj5x";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  errorMessage.textContent = "";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errorMessage.textContent = "Identifiants incorrects.";
    return;
  }

  console.log("Utilisateur connecté :", data.user.email);

  window.location.href = "/dashboard";
});