const app = require("./website");

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur POCO lancé sur le port ${PORT}`);
});