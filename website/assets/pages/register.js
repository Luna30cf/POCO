const SUPABASE_URL =
  "https://kpsduenpvmyvbigcswlu.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_X7wxQ3Rjt_hUXPU2YPkPqA_jUvBsj5x";

const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

const form =
  document.getElementById(
    "register-form"
  );

const errorMessage =
  document.getElementById(
    "error-message"
  );

const successMessage =
  document.getElementById(
    "success-message"
  );

form.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    errorMessage.textContent = "";
    successMessage.textContent = "";

    const email =
      document.getElementById(
        "email"
      ).value.trim();

    const password =
      document.getElementById(
        "password"
      ).value;

    const passwordConfirm =
      document.getElementById(
        "password-confirm"
      ).value;


    if (
      password !==
      passwordConfirm
    ) {
      errorMessage.textContent =
        "Les mots de passe ne correspondent pas.";

      return;
    }


    const {
      data,
      error,
    } =
      await supabaseClient.auth.signUp({
        email,
        password,
      });


    if (error) {
    console.error(
        "Erreur inscription :",
        error
    );

    errorMessage.textContent =
        `${error.message} (${error.status || "sans statut"})`;

    return;
    }


    console.log(
      "Compte créé :",
      data.user
    );


    successMessage.textContent =
      "Compte créé. Vérifiez votre e-mail si une confirmation est demandée.";
  }
);