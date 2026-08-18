const SUPABASE_URL =
  "https://kpsduenpvmyvbigcswlu.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_X7wxQ3Rjt_hUXPU2YPkPqA_jUvBsj5x";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ======================================================
// OUTILS
// ======================================================

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}


// ======================================================
// DASHBOARD
// ======================================================

async function loadDashboard() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "/login";
    return;
  }

  document.getElementById("user-email").textContent =
    session.user.email;

  const potsResponse = await fetch("/api/pots", {
    method: "GET",
    headers: {
      Authorization:
        `Bearer ${session.access_token}`,
    },
  });

  const container =
    document.getElementById("pots-container");

  if (!potsResponse.ok) {
    container.textContent =
      "Erreur lors du chargement des pots.";
    return;
  }

  const pots = await potsResponse.json();

  container.innerHTML = "";

  if (pots.length === 0) {
    container.textContent =
      "Aucun pot associé à ce compte.";
    return;
  }


  // ==================================================
  // UNE CARTE PAR POT
  // ==================================================

  for (const pot of pots) {

    // ==================================================
    // CARTE PRINCIPALE
    // ==================================================

    const potCard =
      createElement("article", "pot-card");


    // --------------------------------------------------
    // HEADER CARTE
    // --------------------------------------------------

    const potHeader =
      createElement("div", "pot-card__header");

    const titleBlock =
      createElement("div", "pot-card__title");

    const title =
      createElement(
        "h2",
        "",
        pot.name
      );

    const mac =
      createElement(
        "span",
        "pot-card__mac",
        `MAC : ${pot.mac_address}`
      );

    titleBlock.appendChild(title);

    potHeader.appendChild(titleBlock);
    potHeader.appendChild(mac);

    potCard.appendChild(potHeader);


    // ==================================================
    // ZONE CENTRALE : PLANTE + ANALYSE
    // ==================================================

    const overview =
      createElement(
        "div",
        "pot-card__overview"
      );


    // --------------------------------------------------
    // COLONNE PLANTE
    // --------------------------------------------------

    const plantPanel =
      createElement(
        "section",
        "panel plant-panel"
      );

    const plantTitle =
      createElement(
        "h3",
        "panel__title",
        "🌱 Ma plante"
      );

    const plantName =
      createElement(
        "p",
        "plant-name",
        "Chargement..."
      );

    const speciesName =
      createElement(
        "p",
        "species-name",
        ""
      );

    plantPanel.appendChild(plantTitle);
    plantPanel.appendChild(plantName);
    plantPanel.appendChild(speciesName);


    // --------------------------------------------------
    // COLONNE ANALYSE
    // --------------------------------------------------

    const decisionPanel =
      createElement(
        "section",
        "panel decision-panel"
      );

    decisionPanel.innerHTML = `
      <h3 class="panel__title">
        🧠 Analyse POCO
      </h3>

      <p class="loading">
        Analyse en cours...
      </p>
    `;

    overview.appendChild(plantPanel);
    overview.appendChild(decisionPanel);

    potCard.appendChild(overview);


    // ==================================================
    // ACTIONS
    // ==================================================

    const actionPanel =
      createElement(
        "section",
        "pot-actions"
      );

    const waterButton =
      createElement(
        "button",
        "button button--primary",
        "💧 Arroser"
      );

    const ledButton =
      createElement(
        "button",
        "button button--secondary",
        "💡 Allumer LED"
      );

    let ledIsOn = false;

    actionPanel.appendChild(waterButton);
    actionPanel.appendChild(ledButton);

    potCard.appendChild(actionPanel);


    // ==================================================
    // RECHERCHE PERENUAL
    // ==================================================

    const searchPanel =
      createElement(
        "section",
        "species-search"
      );

    const searchTitle =
      createElement(
        "h3",
        "panel__title",
        "🔎 Rechercher une espèce"
      );

    const searchHelp =
      createElement(
        "p",
        "species-search__help",
        "Recherche par nom anglais ou scientifique."
      );

    const searchForm =
      createElement(
        "div",
        "species-search__form"
      );

    const searchInput =
      createElement(
        "input",
        "species-search__input"
      );

    searchInput.type = "text";
    searchInput.placeholder =
      "Ex. rose, Rosa, Chamaerops...";

    const searchButton =
      createElement(
        "button",
        "button button--search",
        "Rechercher"
      );

    const searchResults =
      createElement(
        "div",
        "species-results"
      );

    searchForm.appendChild(searchInput);
    searchForm.appendChild(searchButton);

    searchPanel.appendChild(searchTitle);
    searchPanel.appendChild(searchHelp);
    searchPanel.appendChild(searchForm);
    searchPanel.appendChild(searchResults);

    potCard.appendChild(searchPanel);


    container.appendChild(potCard);


    // ==================================================
    // CHARGEMENT PLANTE
    // ==================================================

    async function loadPlant() {
      try {
        const response = await fetch(
          `/api/pots/${pot.id}/plant`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.status === 404) {
          plantName.textContent =
            "Aucune plante associée";

          speciesName.textContent = "";
          return;
        }

        if (!response.ok) {
          plantName.textContent =
            "Erreur de chargement";

          speciesName.textContent = "";
          return;
        }

        const plant =
          await response.json();

        plantName.textContent =
          plant.nickname;

        speciesName.textContent =
          `${plant.species.common_name}
           — ${plant.species.scientific_name}`;

      } catch (error) {
        console.error(
          "Erreur récupération plante :",
          error
        );

        plantName.textContent =
          "Erreur lors du chargement";
      }
    }


    // ==================================================
    // ANALYSE POCO
    // ==================================================

    async function loadDecision() {
      try {
        const response = await fetch(
          `/api/pots/${pot.id}/decision`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          decisionPanel.innerHTML = `
            <h3 class="panel__title">
              🧠 Analyse POCO
            </h3>

            <p>
              Analyse indisponible
            </p>
          `;

          return;
        }

        const decision =
          await response.json();

        const analysis =
          decision.poco_analysis;


        const soilStatus =
          analysis.soil_status ===
          "insufficient"
            ? "Insuffisante"
            : "Correcte";


        const lightStatus =
          analysis.light_status ===
          "insufficient"
            ? "Insuffisante"
            : "Correcte";


        const waterStatus =
          analysis.water_status ===
          "available"
            ? "Disponible"
            : "Insuffisant";


        const soilClass =
          analysis.soil_status ===
          "insufficient"
            ? "status status--warning"
            : "status status--ok";


        const lightClass =
          analysis.light_status ===
          "insufficient"
            ? "status status--warning"
            : "status status--ok";


        const waterClass =
          analysis.water_status ===
          "available"
            ? "status status--ok"
            : "status status--danger";


        decisionPanel.innerHTML = `
          <h3 class="panel__title">
            🧠 Analyse POCO
          </h3>

          <div class="analysis-row">
            <span>💧 Humidité</span>

            <span class="${soilClass}">
              ${soilStatus}
            </span>
          </div>

          <p class="analysis-detail">
            Moyenne :
            ${analysis.average_soil_moisture} %
          </p>

          ${
            analysis.soil_status ===
            "insufficient"
              ? `
                <p class="recommendation">
                  Arrosage recommandé
                </p>
              `
              : ""
          }

          <div class="analysis-row">
            <span>☀️ Luminosité</span>

            <span class="${lightClass}">
              ${lightStatus}
            </span>
          </div>

          <p class="analysis-detail">
            Moyenne :
            ${analysis.average_light_lux} lux
          </p>

          ${
            analysis.light_status ===
            "insufficient"
              ? `
                <p class="recommendation">
                  Éclairage complémentaire recommandé
                </p>
              `
              : ""
          }

          <div class="analysis-row">
            <span>🚰 Réservoir</span>

            <span class="${waterClass}">
              ${waterStatus}
            </span>
          </div>
        `;

      } catch (error) {
        console.error(
          "Erreur analyse POCO :",
          error
        );

        decisionPanel.innerHTML = `
          <h3 class="panel__title">
            🧠 Analyse POCO
          </h3>

          <p>
            Analyse indisponible
          </p>
        `;
      }
    }


    // ==================================================
    // RECHERCHE PERENUAL
    // ==================================================

    async function searchPerenual() {
      const query =
        searchInput.value.trim();

      if (query.length < 2) {
        searchResults.textContent =
          "Saisis au moins 2 caractères.";
        return;
      }

      searchButton.disabled = true;
      searchButton.textContent =
        "Recherche...";

      searchResults.innerHTML =
        `<p>Recherche en cours...</p>`;

      try {
        const response = await fetch(
          `/api/perenual/search?q=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          searchResults.textContent =
            "Erreur lors de la recherche.";
          return;
        }

        const results =
          await response.json();

        searchResults.innerHTML = "";

        if (!results.length) {
          searchResults.textContent =
            "Aucun résultat.";
          return;
        }


        results
          .slice(0, 5)
          .forEach((species) => {

            const result =
              createElement(
                "div",
                "species-result"
              );


            const info =
              createElement(
                "div",
                "species-result__info"
              );


            const commonName =
              createElement(
                "strong",
                "species-result__name",
                species.common_name
              );


            const scientific =
              Array.isArray(
                species.scientific_name
              )
                ? species.scientific_name[0]
                : species.scientific_name;


            const scientificName =
              createElement(
                "span",
                "species-result__scientific",
                scientific
              );


            info.appendChild(commonName);
            info.appendChild(scientificName);


            const assignButton =
              createElement(
                "button",
                "button button--small",
                "Associer"
              );


            assignButton.addEventListener(
              "click",
              async () => {

                assignButton.disabled = true;

                assignButton.textContent =
                  "Association...";


                try {
                  const assignResponse =
                    await fetch(
                      `/api/pots/${pot.id}/species/perenual`,
                      {
                        method: "POST",

                        headers: {
                          Authorization:
                            `Bearer ${session.access_token}`,

                          "Content-Type":
                            "application/json",
                        },

                        body:
                          JSON.stringify({
                            perenualId:
                              species.id,
                          }),
                      }
                    );


                  if (!assignResponse.ok) {
                    const errorData =
                      await assignResponse.json();

                    console.error(
                      "Erreur association Perenual :",
                      errorData
                    );

                    assignButton.textContent =
                      "Erreur";

                    return;
                  }


                  assignButton.textContent =
                    "Associée ✓";


                  await loadPlant();
                  await loadDecision();


                  setTimeout(() => {
                    searchResults.innerHTML = "";
                    searchInput.value = "";
                  }, 1000);


                } catch (error) {
                  console.error(
                    "Erreur association :",
                    error
                  );

                  assignButton.textContent =
                    "Erreur";
                }
              }
            );


            result.appendChild(info);
            result.appendChild(
              assignButton
            );

            searchResults.appendChild(
              result
            );
          });

      } catch (error) {
        console.error(
          "Erreur recherche Perenual :",
          error
        );

        searchResults.textContent =
          "Erreur lors de la recherche.";

      } finally {
        searchButton.disabled = false;

        searchButton.textContent =
          "Rechercher";
      }
    }


    searchButton.addEventListener(
      "click",
      searchPerenual
    );


    searchInput.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Enter") {
          searchPerenual();
        }
      }
    );


    // ==================================================
    // ARROSAGE
    // ==================================================

    waterButton.addEventListener(
      "click",
      async () => {

        waterButton.disabled = true;

        waterButton.textContent =
          "Arrosage...";


        try {
          const response = await fetch(
            `/api/pots/${pot.id}/water`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );


          if (!response.ok) {
            const errorData =
              await response.json();


            waterButton.textContent =
              "Arrosage impossible";


            const message =
              createElement(
                "p",
                "action-error",
                errorData.error ||
                  "Impossible d'arroser"
              );


            actionPanel.appendChild(
              message
            );


            setTimeout(() => {
              message.remove();

              waterButton.textContent =
                "💧 Arroser";

              waterButton.disabled =
                false;
            }, 4000);


            return;
          }


          waterButton.textContent =
            "Arrosage envoyé ✓";


          setTimeout(() => {
            waterButton.textContent =
              "💧 Arroser";

            waterButton.disabled =
              false;
          }, 2000);


        } catch (error) {
          console.error(
            "Erreur arrosage :",
            error
          );


          waterButton.textContent =
            "Erreur";


          setTimeout(() => {
            waterButton.textContent =
              "💧 Arroser";

            waterButton.disabled =
              false;
          }, 2000);
        }
      }
    );


    // ==================================================
    // LED
    // ==================================================

    ledButton.addEventListener(
      "click",
      async () => {

        ledButton.disabled = true;

        const action =
          ledIsOn ? "off" : "on";


        try {
          const response = await fetch(
            `/api/pots/${pot.id}/led`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,

                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  action,
                }),
            }
          );


          if (!response.ok) {
            console.error(
              "Erreur commande LED"
            );

            return;
          }


          ledIsOn = !ledIsOn;


          ledButton.textContent =
            ledIsOn
              ? "💡 Éteindre LED"
              : "💡 Allumer LED";


        } catch (error) {
          console.error(
            "Erreur commande LED :",
            error
          );

        } finally {
          ledButton.disabled = false;
        }
      }
    );


    // ==================================================
    // REALTIME
    // ==================================================

    supabaseClient
      .channel(
        `measurements-${pot.id}`
      )
      .on(
        "postgres_changes",

        {
          event: "INSERT",
          schema: "public",
          table: "measurements",

          filter:
            `pot_id=eq.${pot.id}`,
        },

        async () => {
          await loadDecision();
        }
      )
      .subscribe(
        (status) => {
          console.log(
            `Realtime ${pot.name} :`,
            status
          );
        }
      );


    // ==================================================
    // CHARGEMENT INITIAL
    // ==================================================

    await loadPlant();
    await loadDecision();
  }
}


// ======================================================
// LANCEMENT
// ======================================================

loadDashboard();


// ======================================================
// DÉCONNEXION
// ======================================================

document
  .getElementById(
    "logout-button"
  )
  .addEventListener(
    "click",
    async () => {

      const { error } =
        await supabaseClient.auth.signOut();


      if (error) {
        console.error(
          "Erreur lors de la déconnexion :",
          error
        );

        return;
      }


      window.location.href =
        "/login";
    }
  );