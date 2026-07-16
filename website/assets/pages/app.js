function update() {
  const value = Math.floor(Math.random() * 100);

  const el = document.getElementById("humidity");
  if (el) {
    el.innerText = value;
  }
}