const SUPABASE_URL =
  "https://kpsduenpvmyvbigcswlu.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_X7wxQ3Rjt_hUXPU2YPkPqA_jUvBsj5x";

const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// ======================================================
// ÉLÉMENTS DE LA PAGE
// ======================================================

const plantsContainer =
  document.getElementById(
    "plants-container"
  );

const bluetoothStatus =
  document.getElementById(
    "bluetooth-status"
  );

const logoutButton =
  document.getElementById(
    "logout-button"
  );


// ======================================================
// MODALE WI-FI
// ======================================================

const wifiModal =
  document.getElementById(
    "wifi-modal"
  );

const wifiModalClose =
  document.getElementById(
    "wifi-modal-close"
  );

const wifiPotName =
  document.getElementById(
    "wifi-pot-name"
  );

const wifiSsid =
  document.getElementById(
    "wifi-ssid"
  );

const wifiSecurity =
  document.getElementById(
    "wifi-security"
  );

const wifiPassword =
  document.getElementById(
    "wifi-password"
  );

const wifiPasswordContainer =
  document.getElementById(
    "wifi-password-container"
  );

const sendWifiButton =
  document.getElementById(
    "send-wifi-button"
  );

const wifiStatus =
  document.getElementById(
    "wifi-status"
  );


// ======================================================
// UUID BLE POCO
// ======================================================

const POCO_SERVICE_UUID =
  "12345678-1234-5678-1234-56789abcdef0";

const POCO_SSID_UUID =
  "12345678-1234-5678-1234-56789abcdef1";

const POCO_PASSWORD_UUID =
  "12345678-1234-5678-1234-56789abcdef2";

const POCO_SECURITY_UUID =
  "12345678-1234-5678-1234-56789abcdef3";


let currentPocoService = null;


// ======================================================
// CHARGEMENT DES POTS
// ======================================================

async function loadPlants() {

  const {
    data: { session },
  } =
    await supabaseClient.auth.getSession();


  if (!session) {
    window.location.href = "/";
    return;
  }


  try {

    const response =
      await fetch(
        "/api/pots",
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );


    if (!response.ok) {

      plantsContainer.textContent =
        "Impossible de charger les pots.";

      return;
    }


    const pots =
      await response.json();


    plantsContainer.innerHTML = "";


    // ==================================================
    // CARTES DES POTS
    // ==================================================

    for (const pot of pots) {

      const card =
        document.createElement("button");

      card.type = "button";

      card.className =
        "plant-card";


      const image =
        document.createElement("img");

      image.src =
        "/images/plant.png";

      image.alt =
        "Plante";


      const title =
        document.createElement("h2");

      title.textContent =
        pot.name ||
        "Mon POCO";


      const plantName =
        document.createElement("p");

      plantName.textContent =
        "Chargement de la plante...";


      const mac =
        document.createElement("small");

      mac.textContent =
        pot.mac_address || "";


      // Récupération de la plante associée

      try {

        const plantResponse =
          await fetch(
            `/api/pots/${pot.id}/plant`,
            {
              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );


        if (plantResponse.ok) {

          const plant =
            await plantResponse.json();

          plantName.textContent =
            plant.nickname ||
            plant.species?.common_name ||
            "Ma plante";

        }
        else {

          plantName.textContent =
            "Aucune plante associée";

        }

      }
      catch (error) {

        console.error(
          "Erreur chargement plante :",
          error
        );

        plantName.textContent =
          "Plante indisponible";
      }


      card.appendChild(image);
      card.appendChild(title);
      card.appendChild(plantName);
      card.appendChild(mac);


      // ==================================================
      // OUVERTURE DU DASHBOARD DU POT
      // ==================================================

      card.addEventListener(
        "click",
        () => {

          window.location.href =
            `/dashboard/${pot.id}`;

        }
      );


      plantsContainer.appendChild(
        card
      );
    }


    // ==================================================
    // CARTE AJOUTER UN POT
    // ==================================================

    const addCard =
      document.createElement(
        "button"
      );

    addCard.type =
      "button";

    addCard.id =
      "add-pot-button";

    addCard.className =
      "plant-card plant-card--add";

    addCard.innerHTML = `

      <p>
        Ajouter un pot
      </p>
    `;


    addCard.addEventListener(
      "click",
      addPot
    );


    plantsContainer.appendChild(
      addCard
    );

  }
  catch (error) {

    console.error(
      "Erreur chargement pots :",
      error
    );

    plantsContainer.textContent =
      "Erreur lors du chargement.";
  }
}


// ======================================================
// AJOUT D'UN POT EN BLUETOOTH
// ======================================================

async function addPot() {

  if (!navigator.bluetooth) {

    bluetoothStatus.textContent =
      "Bluetooth non disponible dans ce navigateur.";

    return;
  }


  bluetoothStatus.textContent =
    "Recherche d'un pot POCO...";


  try {

    const device =
      await navigator.bluetooth.requestDevice({
        filters: [
          {
            namePrefix: "poco-",
          },
        ],

        optionalServices: [
          POCO_SERVICE_UUID,
        ],
      });


    bluetoothStatus.textContent =
      `Connexion à ${device.name}...`;


    const server =
      await device.gatt.connect();


    const service =
      await server.getPrimaryService(
        POCO_SERVICE_UUID
      );


    currentPocoService =
      service;


    bluetoothStatus.textContent =
      `Connecté à ${device.name} ✓`;


    wifiPotName.textContent =
      device.name;


    wifiStatus.textContent =
      "";


    wifiModal.hidden =
      false;

  }
  catch (error) {

    console.error(
      "Recherche Bluetooth interrompue :",
      error
    );

    bluetoothStatus.textContent =
      "Aucun pot sélectionné.";
  }
}


// ======================================================
// TYPE DE RÉSEAU WI-FI
// ======================================================

wifiSecurity.addEventListener(
  "change",
  () => {

    const isOpen =
      wifiSecurity.value === "open";


    wifiPasswordContainer.hidden =
      isOpen;


    if (isOpen) {
      wifiPassword.value = "";
    }
  }
);


// ======================================================
// FERMETURE MODALE
// ======================================================

wifiModalClose.addEventListener(
  "click",
  () => {

    wifiModal.hidden =
      true;

  }
);


// ======================================================
// ENVOI DU WI-FI À L'ESP32
// ======================================================

sendWifiButton.addEventListener(
  "click",
  async () => {

    const ssid =
      wifiSsid.value.trim();

    const security =
      wifiSecurity.value;

    const password =
      wifiPassword.value;


    if (!ssid) {

      wifiStatus.textContent =
        "Le nom du réseau est obligatoire.";

      return;
    }


    if (
      security === "password" &&
      !password
    ) {

      wifiStatus.textContent =
        "Le mot de passe est obligatoire.";

      return;
    }


    if (!currentPocoService) {

      wifiStatus.textContent =
        "Le pot n'est plus connecté en Bluetooth.";

      return;
    }


    sendWifiButton.disabled =
      true;

    wifiStatus.textContent =
      "Envoi de la configuration...";


    try {

      const encoder =
        new TextEncoder();


      const ssidCharacteristic =
        await currentPocoService
          .getCharacteristic(
            POCO_SSID_UUID
          );


      const passwordCharacteristic =
        await currentPocoService
          .getCharacteristic(
            POCO_PASSWORD_UUID
          );


      const securityCharacteristic =
        await currentPocoService
          .getCharacteristic(
            POCO_SECURITY_UUID
          );


      // SSID

      await ssidCharacteristic.writeValue(
        encoder.encode(ssid)
      );


      // MOT DE PASSE

      if (
        security === "password"
      ) {

        await passwordCharacteristic
          .writeValue(
            encoder.encode(password)
          );
      }


      // SÉCURITÉ EN DERNIER

      await securityCharacteristic
        .writeValue(
          encoder.encode(security)
        );


      wifiStatus.textContent =
        "Wi-Fi configuré. Association du pot...";


      // ==================================================
      // ASSOCIATION AU COMPTE SUPABASE
      // ==================================================

      const {
        data: { session },
      } =
        await supabaseClient.auth
          .getSession();


      if (!session) {

        throw new Error(
          "Session utilisateur introuvable"
        );
      }


      const deviceId =
        wifiPotName.textContent
          .replace(
            /^poco-/i,
            ""
          )
          .trim();


      const associateResponse =
        await fetch(
          "/api/pots/associate",
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
                deviceId,
              }),
          }
        );


      if (
        !associateResponse.ok
      ) {

        const errorData =
          await associateResponse.json();


        throw new Error(
          errorData.error ||
          "Impossible d'associer le pot"
        );
      }


      const associatedPot =
        await associateResponse.json();


      console.log(
        "Pot associé :",
        associatedPot
      );


      wifiStatus.textContent =
        "Pot configuré et associé ✓";


      setTimeout(
        () => {

          wifiModal.hidden =
            true;

          loadPlants();

        },
        1500
      );

    }
    catch (error) {

      console.error(
        "Erreur provisioning Wi-Fi :",
        error
      );


      wifiStatus.textContent =
        "Erreur pendant la configuration Wi-Fi.";

    }
    finally {

      sendWifiButton.disabled =
        false;

    }
  }
);


// ======================================================
// DÉCONNEXION
// ======================================================

logoutButton.addEventListener(
  "click",
  async () => {

    const { error } =
      await supabaseClient.auth.signOut();


    if (error) {

      console.error(
        "Erreur déconnexion :",
        error
      );

      return;
    }


    window.location.href =
      "/";
  }
);


// ======================================================
// LANCEMENT
// ======================================================

loadPlants();