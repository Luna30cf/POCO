import { useState } from "react"

function App() {
  const [moisture, setMoisture] = useState(45)
  const [status, setStatus] = useState("OK")

  function simulateSensor() {
    const value = Math.floor(Math.random() * 100)
    setMoisture(value)

    if (value < 30) setStatus("CRITIQUE")
    else if (value < 60) setStatus("ATTENTION")
    else setStatus("OK")
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>POCO 🌱</h1>

      <h2>Plante : Basilic</h2>

      <p>💧 Humidité : {moisture}%</p>
      <p>⚠️ État : {status}</p>

      <button onClick={simulateSensor}>
        Simuler capteur
      </button>
    </div>
  )
}

export default App