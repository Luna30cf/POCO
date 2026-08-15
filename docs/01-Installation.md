# POCO — Installation et configuration de l’environnement

## 1. Objectif du document

Ce document décrit toutes les étapes nécessaires pour préparer l’environnement de développement du projet POCO IoT.

Il permet notamment de :

* vérifier l’installation de Python ;
* installer `esptool` ;
* détecter l’ESP32 ;
* installer MicroPython sur la carte ;
* configurer Visual Studio Code ;
* configurer l’extension MicroPico ;
* ouvrir le terminal REPL de l’ESP32 ;
* installer les bibliothèques MicroPython nécessaires ;
* résoudre les principales erreurs rencontrées.

L’objectif est de pouvoir reprendre le projet rapidement sur un nouvel ordinateur ou après une longue période d’interruption.

---

# 2. Matériel nécessaire

Pour réaliser l’installation, il faut disposer de :

* un ordinateur sous Windows ;
* un ESP32 DevKit ;
* un câble USB compatible avec les données ;
* une connexion Internet ;
* Visual Studio Code ;
* Python ;
* le firmware MicroPython compatible avec l’ESP32.

Attention : certains câbles USB permettent uniquement l’alimentation et ne permettent pas de transmettre des données.

Si l’ESP32 n’est pas détecté par l’ordinateur, il faut vérifier le câble avant de modifier la configuration logicielle.

---

# 3. Logiciels utilisés

Le projet utilise les outils suivants :

| Outil              | Fonction                                               |
| ------------------ | ------------------------------------------------------ |
| Python             | Exécution des outils d’installation                    |
| `pip`              | Installation des paquets Python                        |
| `esptool`          | Communication avec l’ESP32 et installation du firmware |
| MicroPython        | Interpréteur Python exécuté sur l’ESP32                |
| Visual Studio Code | Environnement de développement                         |
| MicroPico          | Extension VS Code pour communiquer avec l’ESP32        |
| Git                | Gestion de version du projet                           |
| PowerShell         | Terminal utilisé sous Windows                          |

---

# 4. Installation de Python

## 4.1 Vérifier si Python est installé

Dans PowerShell, exécuter :

```powershell
python --version
```

Une version de Python doit être affichée, par exemple :

```text
Python 3.12.0
```

Il est également possible d’utiliser :

```powershell
py --version
```

Si aucune commande ne fonctionne, Python doit être installé.

---

## 4.2 Installation de Python

Télécharger Python depuis le site officiel puis lancer l’installateur.

Pendant l’installation, vérifier que l’option suivante est cochée :

```text
Add Python to PATH
```

Cette option permet d’utiliser la commande `python` directement dans PowerShell.

Après l’installation, fermer et rouvrir le terminal puis vérifier :

```powershell
python --version
```

---

# 5. Vérification de `pip`

`pip` est le gestionnaire de paquets Python.

Vérifier son installation avec :

```powershell
python -m pip --version
```

Mettre à jour `pip` si nécessaire :

```powershell
python -m pip install --upgrade pip
```

L’utilisation de la forme suivante est recommandée :

```powershell
python -m pip
```

Elle évite certains problèmes lorsque plusieurs versions de Python sont installées sur l’ordinateur.

---

# 6. Installation d’`esptool`

`esptool` permet de détecter l’ESP32, d’effacer sa mémoire flash et d’installer MicroPython.

Installer `esptool` avec :

```powershell
python -m pip install esptool
```

Vérifier l’installation :

```powershell
python -m esptool version
```

Selon la version installée, la commande peut afficher un résultat similaire à :

```text
esptool.py v4.x
```

ou :

```text
esptool v5.x
```

---

# 7. Connexion de l’ESP32

Brancher l’ESP32 à l’ordinateur avec le câble USB.

Sous Windows, la carte doit apparaître sur un port série, par exemple :

```text
COM3
```

Le numéro du port peut être différent selon l’ordinateur.

---

## 7.1 Trouver le port COM

Plusieurs méthodes sont possibles.

### Méthode avec le gestionnaire de périphériques

1. Ouvrir le Gestionnaire de périphériques.
2. Déplier la section :

```text
Ports (COM et LPT)
```

3. Repérer l’ESP32 ou le convertisseur USB série.

Selon la carte, le nom peut contenir :

* CP210x ;
* CH340 ;
* USB Serial Port ;
* Silicon Labs.

---

### Méthode avec PowerShell

Exécuter :

```powershell
[System.IO.Ports.SerialPort]::getportnames()
```

Exemple de résultat :

```text
COM3
```

Pour identifier précisément le bon port, exécuter la commande avant puis après avoir branché l’ESP32.

Le nouveau port affiché correspond normalement à la carte.

---

# 8. Détection de l’ESP32

Une fois le port identifié, utiliser la commande suivante :

```powershell
python -m esptool --port COM3 chip_id
```

Selon la version d’`esptool`, cette commande peut également fonctionner :

```powershell
python -m esptool chip_id
```

Remplacer `COM3` par le port réellement utilisé.

Le résultat obtenu pendant le projet indiquait notamment :

```text
ESP32-D0WD-V3
```

L’adresse MAC de l’ESP32 a également été récupérée :

```text
1C:C3:AB:D2:A7:E4
```

Cette adresse est propre à la carte.

Elle pourra être utilisée pour :

* identifier le pot ;
* générer un identifiant unique ;
* construire le nom BLE ;
* associer l’appareil à un compte utilisateur ;
* construire les topics MQTT.

---

# 9. Problème de connexion avec `esptool`

Dans certains cas, `esptool` peut ne pas parvenir à se connecter à l’ESP32.

Une erreur peut indiquer que la carte n’est pas en mode téléchargement.

Dans ce cas :

1. maintenir le bouton `BOOT` de l’ESP32 ;
2. lancer la commande `esptool` ;
3. attendre que la connexion commence ;
4. relâcher le bouton `BOOT`.

Sur certaines cartes, il peut également être nécessaire d’appuyer brièvement sur le bouton `EN` ou `RESET`.

Exemple :

```powershell
python -m esptool --port COM3 chip_id
```

---

# 10. Téléchargement de MicroPython

Le firmware utilisé est la version générique pour ESP32.

La version installée pendant le projet était :

```text
MicroPython v1.28.0
```

Le fichier téléchargé porte généralement un nom similaire à :

```text
ESP32_GENERIC-202xxxxx-v1.28.0.bin
```

Pour simplifier les commandes, il peut être renommé :

```text
ESP32_GENERIC.bin
```

Placer le fichier dans un dossier facilement accessible.

Exemple :

```text
C:\Users\NomUtilisateur\Downloads\ESP32_GENERIC.bin
```

---

# 11. Se placer dans le dossier du firmware

Dans PowerShell, se déplacer dans le dossier contenant le fichier `.bin`.

Exemple :

```powershell
cd C:\Users\NomUtilisateur\Downloads
```

Vérifier que le fichier est présent :

```powershell
dir
```

Le fichier doit apparaître dans la liste :

```text
ESP32_GENERIC.bin
```

---

# 12. Effacement de la mémoire flash

Avant d’installer MicroPython, il est recommandé d’effacer la mémoire de l’ESP32.

Commande utilisée :

```powershell
python -m esptool --chip esp32 --port COM3 erase_flash
```

Remplacer `COM3` par le port correspondant.

Une fois l’effacement terminé, un message de confirmation doit s’afficher.

Exemple :

```text
Chip erase completed successfully
```

---

# 13. Installation du firmware MicroPython

Installer MicroPython avec la commande suivante :

```powershell
python -m esptool --chip esp32 --port COM3 write_flash -z 0x1000 ESP32_GENERIC.bin
```

La valeur :

```text
0x1000
```

correspond à l’adresse de départ utilisée pour le firmware générique ESP32.

Si le fichier n’est pas dans le dossier courant, indiquer son chemin complet :

```powershell
python -m esptool --chip esp32 --port COM3 write_flash -z 0x1000 "C:\Users\NomUtilisateur\Downloads\ESP32_GENERIC.bin"
```

À la fin de l’installation, la commande doit indiquer que les données ont été écrites avec succès.

---

# 14. Redémarrage de la carte

Après l’installation du firmware :

1. appuyer sur le bouton `EN` ou `RESET` ;
2. ou débrancher puis rebrancher l’ESP32.

La carte doit alors démarrer sous MicroPython.

---

# 15. Installation de Visual Studio Code

Installer Visual Studio Code.

Une fois installé, ouvrir VS Code puis installer l’extension :

```text
MicroPico
```

L’extension permet notamment de :

* initialiser un projet MicroPython ;
* détecter l’ESP32 ;
* ouvrir le REPL ;
* téléverser les fichiers ;
* exécuter les scripts sur la carte ;
* synchroniser le projet local avec l’ESP32.

---

# 16. Initialisation du projet MicroPico

Créer ou ouvrir le dossier du projet POCO IoT dans VS Code.

Exemple :

```text
POCO-IOT
```

Ouvrir la palette de commandes avec :

```text
Ctrl + Shift + P
```

Puis rechercher :

```text
MicroPico: Initialize MicroPico Project
```

Selon la version de l’extension, le nom peut être légèrement différent :

```text
MicroPico: Initialize Project
```

Cette commande initialise le projet pour MicroPython.

---

# 17. Connexion de MicroPico à l’ESP32

Toujours depuis la palette de commandes :

```text
Ctrl + Shift + P
```

Rechercher :

```text
MicroPico: Connect
```

Sélectionner le port COM correspondant à l’ESP32.

Exemple :

```text
COM3
```

Lorsque la connexion fonctionne, MicroPico doit indiquer que l’ESP32 est connecté.

---

# 18. Ouverture du terminal REPL

Le REPL est le terminal interactif de MicroPython.

Il permet d’exécuter directement des commandes Python sur l’ESP32.

Dans la palette de commandes, rechercher :

```text
MicroPico: Open REPL
```

Le terminal doit afficher un résultat similaire à :

```text
MicroPython v1.28.0 on 2026-xx-xx; Generic ESP32 module with ESP32
Type "help()" for more information.
>>>
```

Le symbole :

```text
>>>
```

signifie que l’ESP32 est prêt à recevoir des commandes.

---

# 19. Premier test MicroPython

Dans le REPL, saisir :

```python
print("POCO TEST")
```

Résultat attendu :

```text
POCO TEST
```

Il est également possible de vérifier la version de MicroPython :

```python
import sys
print(sys.implementation)
```

---

# 20. Test de la LED intégrée

Selon le modèle d’ESP32, une LED intégrée peut être connectée au GPIO 2.

Test possible :

```python
from machine import Pin
import time

led = Pin(2, Pin.OUT)

led.value(1)
time.sleep(1)
led.value(0)
```

Certaines cartes n’utilisent pas le GPIO 2 ou ne possèdent pas de LED intégrée.

L’absence de réaction ne signifie donc pas nécessairement que MicroPython ne fonctionne pas.

---

# 21. Création des fichiers principaux

Les fichiers principaux d’un projet MicroPython sont :

```text
boot.py
main.py
```

## `boot.py`

Ce fichier est exécuté en premier au démarrage de l’ESP32.

Il peut contenir :

* des paramètres système ;
* l’initialisation de certaines interfaces ;
* une configuration minimale.

Il est recommandé d’éviter d’y placer toute la logique du projet.

---

## `main.py`

Ce fichier est exécuté automatiquement après `boot.py`.

Il constitue le point d’entrée principal du programme.

Exemple :

```python
print("Démarrage de POCO")
```

Lorsque la carte redémarre, cette ligne est exécutée automatiquement.

---

# 22. Arborescence prévue du projet

L’arborescence cible du projet est la suivante :

```text
POCO-IOT/
│
├── boot.py
├── main.py
├── config.py
├── wifi.py
├── mqtt_client.py
├── ble_provisioning.py
│
├── sensors/
│   ├── __init__.py
│   ├── soil.py
│   ├── light.py
│   └── water.py
│
├── actuators/
│   ├── __init__.py
│   ├── pump.py
│   └── grow_light.py
│
├── storage/
│   ├── __init__.py
│   └── settings.py
│
└── docs/
```

Cette structure sera mise en place progressivement.

---

# 23. Téléversement d’un fichier vers l’ESP32

Après avoir créé un fichier dans VS Code, utiliser MicroPico pour l’envoyer à la carte.

Dans la palette de commandes :

```text
MicroPico: Upload current file to Pico
```

Selon la version de l’extension, la commande peut aussi être :

```text
MicroPico: Upload Project to Pico
```

Malgré le terme `Pico`, l’extension fonctionne également avec l’ESP32 sous MicroPython.

Il est important de vérifier que le fichier est bien présent sur la carte et pas seulement enregistré sur l’ordinateur.

---

# 24. Exécution d’un fichier

Pour exécuter le fichier actuellement ouvert :

```text
MicroPico: Run current file
```

Il est également possible de copier temporairement le code dans le REPL pour effectuer un test rapide.

---

# 25. Interrompre un programme

Si un programme contient une boucle infinie, le REPL peut sembler bloqué.

Pour arrêter le programme, utiliser :

```text
Ctrl + C
```

Un message similaire doit apparaître :

```text
KeyboardInterrupt
```

Le REPL redevient ensuite disponible :

```text
>>>
```

---

# 26. Redémarrage logiciel de MicroPython

Pour effectuer un redémarrage logiciel depuis le REPL :

```text
Ctrl + D
```

Cela provoque un soft reboot.

Le terminal affiche généralement :

```text
MPY: soft reboot
```

Puis `boot.py` et `main.py` sont de nouveau exécutés.

---

# 27. Connexion Wi-Fi de test

Une connexion Wi-Fi a été testée avec le module `network`.

Exemple :

```python
import network
import time

WIFI_SSID = "NOM_DU_WIFI"
WIFI_PASSWORD = "MOT_DE_PASSE"

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

if not wlan.isconnected():
    print("Connexion au Wi-Fi...")
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    while not wlan.isconnected():
        time.sleep(1)

print("Connecté")
print(wlan.ifconfig())
```

Résultat obtenu pendant les tests :

```text
Connecté
('10.80.117.231', ...)
```

L’adresse IP obtenue peut changer selon le réseau.

---

# 28. Vérification de l’état du Wi-Fi

Les commandes suivantes ont été utilisées dans le REPL :

```python
wlan.active()
```

```python
wlan.isconnected()
```

```python
wlan.status()
```

```python
wlan.ifconfig()
```

Lors d’un premier test, les résultats étaient :

```text
Actif : False
Connecté : False
Statut : 1000
```

Cela signifiait que l’interface Wi-Fi n’était pas activée et que la carte n’était pas connectée.

Après activation et connexion, `wlan.isconnected()` doit retourner :

```python
True
```

---

# 29. Test DNS et connexion Internet

Avant d’installer une bibliothèque avec `mip`, il faut vérifier que l’ESP32 possède un accès à Internet.

Test utilisé :

```python
import socket

socket.getaddrinfo("micropython.org", 443)
```

Si une liste d’adresses est retournée, la résolution DNS fonctionne.

Si une erreur apparaît, vérifier :

* la connexion Wi-Fi ;
* le mot de passe ;
* le DNS fourni par le réseau ;
* l’accès Internet ;
* la qualité du signal.

---

# 30. Installation d’une bibliothèque MicroPython

MicroPython dispose du gestionnaire de paquets `mip`.

La bibliothèque MQTT a été installée avec :

```python
import mip

mip.install("umqtt.simple")
```

Résultat obtenu :

```text
Installing umqtt.simple...
Done
```

La bibliothèque a été installée sur l’ESP32 dans un emplacement similaire à :

```text
/lib/umqtt/simple.mpy
```

---

# 31. Erreur rencontrée lors de l’installation MQTT

La première tentative d’installation a retourné :

```text
OSError: -202
```

Cette erreur était liée à l’absence de connexion Wi-Fi ou à un problème de résolution DNS.

La procédure de résolution a été :

1. vérifier l’activation du Wi-Fi ;
2. vérifier `wlan.isconnected()` ;
3. afficher `wlan.ifconfig()` ;
4. se connecter au Wi-Fi ;
5. tester le DNS avec `socket.getaddrinfo()` ;
6. relancer l’installation.

Après connexion au Wi-Fi, la commande suivante a fonctionné :

```python
mip.install("umqtt.simple")
```

---

# 32. Vérification de la bibliothèque MQTT

Tester l’import :

```python
from umqtt.simple import MQTTClient
```

Si aucune erreur n’apparaît, la bibliothèque est disponible sur l’ESP32.

---

# 33. Avertissement Pylance dans VS Code

VS Code peut afficher l’avertissement suivant :

```text
Import "umqtt.simple" could not be resolved
```

Cet avertissement est normal.

La bibliothèque `umqtt.simple` est installée sur l’ESP32, mais elle n’est pas installée dans l’environnement Python de l’ordinateur.

Pylance analyse les bibliothèques disponibles localement sur le PC et ne connaît pas automatiquement celles stockées sur la carte.

L’avertissement peut donc être ignoré si l’import fonctionne dans le REPL :

```python
from umqtt.simple import MQTTClient
```

---

# 34. Test de connexion MQTT

Le broker utilisé pendant les premiers tests est :

```text
broker.emqx.io
```

Le port utilisé est :

```text
1883
```

Code de test :

```python
from umqtt.simple import MQTTClient

client = MQTTClient(
    client_id="poco-test",
    server="broker.emqx.io",
    port=1883
)

client.connect()

print("Connecté au broker !")
```

Résultat obtenu :

```text
Connecté au broker !
```

---

# 35. Publication d’un premier message MQTT

Premier test de publication :

```python
client.publish(
    b"poco/soil_sensor",
    b"Bonjour depuis POCO !"
)

print("Message envoyé")
```

Résultat obtenu :

```text
Message envoyé
```

Le topic définitif retenu ensuite est :

```text
poco/1hz3c6f7m9a/soil_sensor
```

---

# 36. Fichier de configuration

Les données sensibles et les paramètres variables ne doivent pas être écrits directement dans `main.py`.

Un fichier `config.py` peut être utilisé :

```python
WIFI_SSID = "NOM_DU_WIFI"
WIFI_PASSWORD = "MOT_DE_PASSE"

MQTT_HOST = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC_SOIL = b"poco/1hz3c6f7m9a/soil_sensor"

DEVICE_ID = "1hz3c6f7m9a"
```

Attention : ce fichier ne doit pas être publié sur un dépôt public s’il contient de vrais identifiants Wi-Fi.

---

# 37. Fichier d’exemple pour Git

Créer un fichier :

```text
config.example.py
```

Exemple :

```python
WIFI_SSID = "YOUR_WIFI_NAME"
WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"

MQTT_HOST = "broker.emqx.io"
MQTT_PORT = 1883
MQTT_TOPIC_SOIL = b"poco/DEVICE_ID/soil_sensor"

DEVICE_ID = "DEVICE_ID"
```

Chaque développeur peut ensuite copier ce fichier :

```powershell
Copy-Item config.example.py config.py
```

---

# 38. Protection des informations sensibles

Ajouter le fichier réel de configuration dans `.gitignore` :

```gitignore
config.py
secrets.py
wifi_credentials.json
```

Il ne faut jamais publier :

* le mot de passe Wi-Fi ;
* une clé API ;
* un secret Supabase ;
* un jeton d’authentification ;
* un mot de passe MQTT ;
* un certificat privé.

---

# 39. Installation de Git

Vérifier si Git est installé :

```powershell
git --version
```

Initialiser un dépôt dans le dossier du projet :

```powershell
git init
```

Vérifier l’état du dépôt :

```powershell
git status
```

Ajouter les fichiers :

```powershell
git add .
```

Créer un commit :

```powershell
git commit -m "Initialisation du projet POCO IoT"
```

---

# 40. Structure minimale du `.gitignore`

Exemple de fichier `.gitignore` :

```gitignore
# Configuration sensible
config.py
secrets.py
wifi_credentials.json

# Environnements Python locaux
.venv/
venv/
__pycache__/
*.pyc

# VS Code
.vscode/

# Fichiers système
.DS_Store
Thumbs.db

# Firmware téléchargé
*.bin
```

Le dossier `.vscode/` peut être conservé si le projet contient une configuration utile et non sensible.

---

# 41. Vérification complète après installation

Après avoir préparé l’environnement, vérifier les éléments suivants.

## Côté ordinateur

```powershell
python --version
```

```powershell
python -m pip --version
```

```powershell
python -m esptool version
```

```powershell
git --version
```

---

## Côté ESP32

Dans le REPL :

```python
print("POCO OK")
```

```python
import sys
print(sys.implementation)
```

```python
import network
```

```python
from machine import Pin, ADC
```

```python
from umqtt.simple import MQTTClient
```

Si toutes ces commandes fonctionnent, l’environnement est opérationnel.

---

# 42. Procédure rapide de reprise

Lors d’une reprise du projet, suivre cette procédure.

## Étape 1 — Brancher l’ESP32

Brancher la carte en USB et vérifier le port COM.

## Étape 2 — Ouvrir le projet

Ouvrir le dossier `POCO-IOT` dans VS Code.

## Étape 3 — Connecter MicroPico

Exécuter :

```text
MicroPico: Connect
```

## Étape 4 — Ouvrir le REPL

Exécuter :

```text
MicroPico: Open REPL
```

## Étape 5 — Vérifier MicroPython

```python
print("POCO reprise")
```

## Étape 6 — Vérifier le Wi-Fi

```python
import network

wlan = network.WLAN(network.STA_IF)

print(wlan.active())
print(wlan.isconnected())
print(wlan.ifconfig())
```

## Étape 7 — Vérifier MQTT

```python
from umqtt.simple import MQTTClient
```

## Étape 8 — Lire les documents de suivi

Consulter :

```text
docs/TODO.md
docs/CHANGELOG.md
docs/DECISIONS.md
```

---

# 43. Réinstallation complète rapide

En cas de changement d’ordinateur ou de carte réinitialisée :

```powershell
python -m pip install --upgrade pip
```

```powershell
python -m pip install esptool
```

```powershell
python -m esptool --port COM3 chip_id
```

```powershell
python -m esptool --chip esp32 --port COM3 erase_flash
```

```powershell
python -m esptool --chip esp32 --port COM3 write_flash -z 0x1000 ESP32_GENERIC.bin
```

Puis dans VS Code :

```text
Installer MicroPico
Initialiser le projet
Connecter l’ESP32
Ouvrir le REPL
Téléverser le projet
```

Enfin, sur l’ESP32 connecté à Internet :

```python
import mip
mip.install("umqtt.simple")
```

---

# 44. Problèmes fréquents

## L’ESP32 n’apparaît pas dans les ports COM

Causes possibles :

* câble USB uniquement prévu pour la charge ;
* pilote USB-série manquant ;
* port USB défectueux ;
* carte mal branchée ;
* câble défectueux.

Solutions :

* changer de câble ;
* changer de port USB ;
* vérifier le gestionnaire de périphériques ;
* installer le pilote CP210x ou CH340 selon la carte.

---

## `esptool` ne se connecte pas

Solutions :

* vérifier le port COM ;
* fermer MicroPico ou tout autre terminal série ;
* maintenir le bouton `BOOT` ;
* appuyer sur `RESET` ;
* débrancher puis rebrancher la carte.

Un seul logiciel peut généralement utiliser le port série à la fois.

---

## Le REPL ne répond plus

Utiliser :

```text
Ctrl + C
```

Puis :

```text
Ctrl + D
```

Si cela ne fonctionne pas :

* appuyer sur `RESET` ;
* débrancher et rebrancher l’ESP32 ;
* reconnecter MicroPico.

---

## `main.py` redémarre immédiatement

Un programme exécuté automatiquement peut bloquer la carte.

Utiliser rapidement :

```text
Ctrl + C
```

dans le REPL après le redémarrage.

Corriger ensuite le fichier `main.py`.

Il est recommandé de tester un nouveau module séparément avant de l’ajouter au démarrage automatique.

---

## Erreur `OSError: -202`

Cause probable :

* absence de connexion Internet ;
* DNS indisponible ;
* interface Wi-Fi inactive.

Vérifier :

```python
wlan.active()
wlan.isconnected()
wlan.ifconfig()
```

Puis :

```python
import socket
socket.getaddrinfo("micropython.org", 443)
```

---

## Import MQTT non reconnu dans VS Code

Avertissement :

```text
Import "umqtt.simple" could not be resolved
```

Ce problème concerne Pylance et non l’ESP32.

Vérifier l’import directement sur la carte :

```python
from umqtt.simple import MQTTClient
```

---

# 45. État actuel de l’environnement

Les éléments suivants ont été validés :

* ESP32 détecté par l’ordinateur ;
* modèle identifié : ESP32-D0WD-V3 ;
* MicroPython v1.28.0 installé ;
* Visual Studio Code configuré ;
* MicroPico fonctionnel ;
* REPL accessible ;
* lecture ADC fonctionnelle ;
* connexion Wi-Fi fonctionnelle ;
* résolution DNS fonctionnelle ;
* `mip` fonctionnel ;
* `umqtt.simple` installé ;
* connexion au broker MQTT validée ;
* publication d’un message validée.

L’environnement est donc prêt pour la poursuite du développement de POCO.
