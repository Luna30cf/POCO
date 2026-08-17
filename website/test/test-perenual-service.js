const {
  saveSpeciesFromPerenual,
} = require("../services/perenual.services");

async function test() {
  try {
    const species = await saveSpeciesFromPerenual(1826);

    console.log("Espèce enregistrée :");
    console.log(species);

  } catch (error) {
    console.error(
      "Erreur :",
      error.message
    );
  }
}

test();