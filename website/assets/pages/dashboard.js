const SUPABASE_URL = "https://kpsduenpvmyvbigcswlu.supabase.co";
const SUPABASE_KEY = "sb_publishable_X7wxQ3Rjt_hUXPU2YPkPqA_jUvBsj5x";


const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadDashboard() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "/login";
    return;
  }

  document.getElementById("user-email").textContent =
    "Connecté : " + session.user.email;

  const response = await fetch("/api/pots", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    document.getElementById("pots-container").textContent =
      "Erreur lors du chargement des pots.";
    return;
  }

  const pots = await response.json();

  const container = document.getElementById("pots-container");
  container.innerHTML = "";

  if (pots.length === 0) {
    container.textContent = "Aucun pot associé à ce compte.";
    return;
  }

  pots.forEach((pot) => {
    const potElement = document.createElement("div");

    potElement.innerHTML = `
      <h3>${pot.name}</h3>
      <p>Adresse MAC : ${pot.mac_address}</p>
    `;

    container.appendChild(potElement);
  });
}

loadDashboard();

document
  .getElementById("logout-button")
  .addEventListener("click", async () => {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Erreur lors de la déconnexion :", error);
      return;
    }

    window.location.href = "/login";
  });