# POCO – Reprise du projet IoT (ESP32 + MicroPython)

## Objectif

Cette documentation permet de remettre rapidement en route l'environnement de développement du projet POCO après une période d'inactivité.

---

# 1. Matériel utilisé

* ESP32 DevKit (ESP32-D0WD-V3)
* Capteur d'humidité capacitif v1.2
* Câble USB-C
* PC sous Windows
* VS Code
* Extension MicroPico
* Firmware MicroPython

---

# 2. Structure du projet

```text
POCO/
│
├── .micropico
├── main.py
├── boot.py (optionnel)
├── config.py (à venir)
│
├── sensors/
│   ├── soil.py
│   ├── light.py
│   └── water.py
│
├── mqtt_client.py
├── wifi.py
│
└── README.md
```

---

# 3. Logiciels nécessaires

## Python

Vérifier l'installation :

```bash
python --version
```

---

## esptool

Installation :

```bash
pip install esptool
```

Vérification :

```bash
python -m esptool version
```

---

## VS Code

Installer :

* VS Code
* Extension **MicroPico**

---

# 4. Vérifier que l'ESP32 est détecté

Brancher l'ESP32 en USB.

Lister les ports :

```powershell
[System.IO.Ports.SerialPort]::GetPortNames()
```

Le port utilisé pendant le développement était :

```text
COM3
```

Identifier l'ESP32 :

```bash
python -m esptool chip_id
```

Résultat attendu (ou similaire) :

```text
Chip is ESP32-D0WD-V3
MAC: 1C:C3:AB:D2:A7:E4
```

---

# 5. Réinstaller MicroPython (si nécessaire)

Effacer la mémoire :

```bash
python -m esptool --chip esp32 --port COM3 erase_flash
```

Flasher MicroPython :

```bash
python -m esptool --chip esp32 --port COM3 write_flash -z 0x1000 firmware/ESP32_GENERIC.bin
```

> Adapter le chemin et le nom du firmware si besoin.

---

# 6. Ouvrir le projet

Dans VS Code :

* Ouvrir le dossier `POCO`
* Vérifier la présence du fichier `.micropico`
* Si nécessaire, lancer :

  * `MicroPico: Initialize Project`

---

# 7. Connexion à l'ESP32

Ouvrir le terminal REPL via MicroPico.

Le démarrage normal affiche :

```text
MicroPython v1.28.0

>>>
```

Tester :

```python
print("POCO OK")
```

Résultat attendu :

```text
POCO OK
```

---

# 8. Câblage actuel

## Capteur d'humidité capacitif v1.2

| Capteur | ESP32  |
| ------- | ------ |
| VCC     | 3V3    |
| GND     | GND    |
| AO      | GPIO34 |

---

# 9. Prochaine feuille de route

## Étape 1

Lecture du capteur d'humidité.

Objectif :

* récupérer la valeur analogique ;
* calibrer les valeurs sol sec / humide.

---

## Étape 2

Connexion Wi-Fi.

---

## Étape 3

Connexion au broker MQTT.

---

## Étape 4

Publication MQTT.

Topic prévu :

```text
poco/sensors
```

Premier message :

```json
{
  "humidity_raw": 12345
}
```

---

## Étape 5

Développement du backend.

Le backend devra :

* s'abonner au topic MQTT ;
* recevoir les mesures ;
* les traiter ;
* les stocker (si nécessaire) ;
* les transmettre au dashboard.

---

## Étape 6

Ajout progressif des autres éléments :

* BH1750 (luminosité)
* Flotteur de niveau d'eau
* Pompe
* LED de croissance
* Deep Sleep
* Commandes MQTT

---

# 10. Bonnes pratiques

* Tester une fonctionnalité à la fois.
* Vérifier chaque étape avant de passer à la suivante.
* Conserver les identifiants Wi-Fi et MQTT dans `config.py` (ne jamais les versionner sur GitHub).
* Commiter régulièrement le projet.
* Documenter chaque nouvelle fonctionnalité dans le README.

---

# État actuel du projet

## Fonctionnel

* Environnement MicroPython installé.
* ESP32 détecté et accessible.
* Communication série opérationnelle.
* Projet MicroPico initialisé.

## À réaliser

* Lecture du capteur d'humidité.
* Connexion Wi-Fi.
* Communication MQTT.
* Intégration avec le site web.
