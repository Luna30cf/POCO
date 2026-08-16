const SUPABASE_URL = "https://kpsduenpvmyvbigcswlu.supabase.co";
const SUPABASE_KEY = "sb_publishable_X7wxQ3Rjt_hUXPU2YPkPqA_jUvBsj5x";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


async function loadDashboard() {

  // Récupération de la session Supabase
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();


  // Protection du dashboard
  if (!session) {
    window.location.href = "/login";
    return;
  }


  document.getElementById("user-email").textContent =
    "Connecté : " + session.user.email;


  // Récupération des pots de l'utilisateur
  const potsResponse = await fetch("/api/pots", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });


  if (!potsResponse.ok) {
    document.getElementById("pots-container").textContent =
      "Erreur lors du chargement des pots.";
    return;
  }


  const pots = await potsResponse.json();

  const container = document.getElementById("pots-container");
  container.innerHTML = "";


  if (pots.length === 0) {
    container.textContent = "Aucun pot associé à ce compte.";
    return;
  }


  // Pour chaque pot de l'utilisateur
  for (const pot of pots) {

    const potElement = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = pot.name;

    const mac = document.createElement("p");
    mac.textContent = "Adresse MAC : " + pot.mac_address;

    const humidity = document.createElement("p");
    humidity.textContent = "Humidité : chargement...";

    const light = document.createElement("p");
    light.textContent = "Luminosité : chargement...";

    const water = document.createElement("p");
    water.textContent = "Niveau d'eau : chargement...";

    potElement.appendChild(title);
    potElement.appendChild(mac);
    potElement.appendChild(humidity);
    potElement.appendChild(light);
    potElement.appendChild(water);

    container.appendChild(potElement);


    // Récupération de la dernière mesure du pot
    try {

      const measurementResponse = await fetch(
        `/api/measurements/${pot.id}/latest`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );


      if (measurementResponse.status === 404) {
        humidity.textContent = "Humidité : aucune mesure disponible";
        continue;
      }


      if (!measurementResponse.ok) {
        humidity.textContent = "Humidité : erreur de chargement";
        continue;
      }


      const measurement = await measurementResponse.json();

      humidity.textContent =
      `Humidité : ${measurement.soil_moisture} %`;

    light.textContent =
      `Luminosité : ${measurement.light_lux} lux`;

    water.textContent =
      measurement.water_level
        ? "Niveau d'eau : OK"
        : "Niveau d'eau : BAS";


    } catch (error) {

      console.error(
        "Erreur récupération mesure :",
        error
      );

      humidity.textContent =
        "Humidité : erreur de chargement";
    }
  }
}


loadDashboard();


// Déconnexion
document
  .getElementById("logout-button")
  .addEventListener("click", async () => {

    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      console.error(
        "Erreur lors de la déconnexion :",
        error
      );
      return;
    }

    window.location.href = "/login";
  });