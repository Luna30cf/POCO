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

  for (const pot of pots) {

    const waterButton = document.createElement("button");
    waterButton.textContent = "Arroser";

    const potElement = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = pot.name;

    const plantName = document.createElement("p");
    plantName.textContent = "Plante : chargement...";

    const speciesName = document.createElement("p");
    speciesName.textContent = "Espèce : chargement...";

    const mac = document.createElement("p");
    mac.textContent = "Adresse MAC : " + pot.mac_address;

    const humidity = document.createElement("p");
    humidity.textContent = "Humidité : chargement...";

    const light = document.createElement("p");
    light.textContent = "Luminosité : chargement...";

    const water = document.createElement("p");
    water.textContent = "Niveau d'eau : chargement...";

    potElement.appendChild(title);
    potElement.appendChild(plantName);
    potElement.appendChild(speciesName);
    potElement.appendChild(mac);
    potElement.appendChild(humidity);
    potElement.appendChild(light);
    potElement.appendChild(water);
    potElement.appendChild(waterButton);

    container.appendChild(potElement);

    try {
      const plantResponse = await fetch(
        `/api/pots/${pot.id}/plant`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (plantResponse.status === 404) {
        plantName.textContent = "Aucune plante associée";
        speciesName.textContent = "";
      }

      else if (!plantResponse.ok) {
        plantName.textContent =
          "Erreur lors du chargement de la plante";
        speciesName.textContent = "";
      }

      else {
        const plant = await plantResponse.json();

        plantName.textContent =
          `Plante : ${plant.nickname}`;

        speciesName.textContent =
          `Espèce : ${plant.species.common_name} — ${plant.species.scientific_name}`;
      }

    } catch (error) {
      console.error(
        "Erreur récupération plante :",
        error
      );

      plantName.textContent =
        "Erreur lors du chargement de la plante";
    }

    // Chargement initial
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
      } else if (!measurementResponse.ok) {
        humidity.textContent = "Humidité : erreur de chargement";
      } else {
        const measurement = await measurementResponse.json();

        humidity.textContent =
          `Humidité : ${measurement.soil_moisture} %`;

        light.textContent =
          `Luminosité : ${measurement.light_lux} lux`;

        water.textContent =
          measurement.water_level
            ? "Niveau d'eau : OK"
            : "Niveau d'eau : BAS";
      }
    } catch (error) {
      console.error("Erreur récupération mesure :", error);
    }

    // Realtime pour ce pot
    supabaseClient
      .channel(`measurements-${pot.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "measurements",
          filter: `pot_id=eq.${pot.id}`,
        },
        (payload) => {
          const measurement = payload.new;

          humidity.textContent =
            `Humidité : ${measurement.soil_moisture} %`;

          light.textContent =
            `Luminosité : ${measurement.light_lux} lux`;

          water.textContent =
            measurement.water_level
              ? "Niveau d'eau : OK"
              : "Niveau d'eau : BAS";
        }
      )
      .subscribe((status) => {
        console.log(`Realtime ${pot.name} :`, status);
      });

      waterButton.addEventListener("click", async () => {
        try {
          waterButton.disabled = true;
          waterButton.textContent = "Arrosage...";

          const response = await fetch(
            `/api/pots/${pot.id}/water`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();

            console.error(
              "Erreur commande arrosage :",
              errorData
            );

            waterButton.textContent = "Arrosage impossible";

            const errorMessage = document.createElement("p");
            errorMessage.textContent =
              errorData.error || "Impossible d'arroser";

            errorMessage.style.color = "red";

            potElement.appendChild(errorMessage);

            setTimeout(() => {
              errorMessage.remove();

              waterButton.textContent = "Arroser";
              waterButton.disabled = false;
            }, 4000);

            return;
          }

          waterButton.textContent = "Arrosage envoyé ✓";

          setTimeout(() => {
            waterButton.textContent = "Arroser";
            waterButton.disabled = false;
          }, 2000);

        } catch (error) {
          console.error(
            "Erreur lors de l'arrosage :",
            error
          );

          waterButton.textContent = "Erreur";
        }
      });
  }
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