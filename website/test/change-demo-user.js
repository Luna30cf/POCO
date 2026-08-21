require("dotenv").config();

const supabaseAdmin =
  require("../config/supabaseAdmin");

async function changeDemoUser() {
  const USER_ID =
    "9a4a09b1-1ba4-4961-b6ec-78b56eab2d62";

  const { data, error } =
    await supabaseAdmin.auth.admin.updateUserById(
      USER_ID,
      {
        email:
          "test-public@poco.fr",

        password:
          "PUBLICpoco6*",

        email_confirm: true,
      }
    );

  if (error) {
    console.error(
      "Erreur modification utilisateur :",
      error.message
    );

    return;
  }

  console.log(
    "Utilisateur modifié :",
    data.user.email
  );
}

changeDemoUser();