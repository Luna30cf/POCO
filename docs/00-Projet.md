# POCO — Présentation générale du projet IoT

## 1. Présentation du projet

POCO est un pot de plante connecté conçu pour simplifier l’entretien des plantes d’intérieur.

Le système permet de surveiller plusieurs informations importantes pour la santé de la plante, notamment :

* l’humidité du sol ;
* la luminosité reçue ;
* le niveau d’eau disponible dans le réservoir.

Le pot est également capable d’agir sur son environnement grâce à :

* une pompe à eau ;
* un système d’éclairage artificiel.

Les données sont envoyées vers une application web afin que l’utilisateur puisse consulter l’état de sa plante et interagir avec le pot à distance.

Le projet est réalisé dans le cadre de la validation d’un titre RNCP de niveau 6 orienté conception et développement d’applications numériques.

L’objectif principal est de produire un prototype fonctionnel, documenté, modulaire et démontrable.

---

## 2. Contexte

Les plantes d’intérieur apportent de la vie dans les logements et peuvent contribuer au bien-être de leurs occupants.

Cependant, leur entretien peut être difficile pour les personnes qui :

* ne possèdent pas de connaissances en botanique ;
* oublient régulièrement d’arroser leurs plantes ;
* ne savent pas évaluer l’humidité du sol ;
* ne connaissent pas les besoins en luminosité de leur plante ;
* disposent de peu de temps pour effectuer un suivi régulier.

POCO cherche à répondre à cette problématique en automatisant une partie de la surveillance et de l’entretien de la plante.

---

## 3. Problématique

Comment concevoir un système connecté capable de surveiller l’environnement d’une plante, de transmettre les informations à une application web et d’exécuter des actions à distance, tout en restant simple à utiliser pour une personne ne possédant pas de connaissances techniques ou botaniques ?

---

## 4. Objectifs du projet

Le prototype POCO doit être capable de :

* mesurer l’humidité du sol ;
* convertir cette mesure en un pourcentage compréhensible ;
* mesurer la luminosité en lux ;
* détecter la présence ou l’absence d’eau dans le réservoir ;
* activer une pompe à eau ;
* activer des LED de croissance ;
* se connecter à un réseau Wi-Fi ;
* transmettre ses mesures à un broker MQTT ;
* recevoir des commandes à distance ;
* associer un pot à un compte utilisateur ;
* permettre la configuration initiale du Wi-Fi par Bluetooth Low Energy ;
* afficher les données dans une interface web ;
* enregistrer les mesures dans une base de données ;
* utiliser le mode deep sleep de l’ESP32 lorsque cela est pertinent.

---

## 5. Parcours utilisateur prévu

### 5.1 Création du compte

L’utilisateur commence par créer un compte sur l’application POCO.

Son compte lui permet de :

* gérer une ou plusieurs plantes ;
* associer un ou plusieurs pots connectés ;
* consulter les mesures ;
* accéder à l’historique ;
* envoyer des commandes au pot.

---

### 5.2 Ajout d’un nouveau pot

Depuis l’application, l’utilisateur sélectionne l’action :

```text
Ajouter un pot
```

L’application lance ensuite une recherche des appareils POCO disponibles en Bluetooth Low Energy.

Le pot apparaît avec un nom unique, par exemple :

```text
POCO-A7E4
```

L’utilisateur sélectionne le pot détecté.

---

### 5.3 Configuration du Wi-Fi

Lors du premier appairage, l’application transmet au pot, par BLE :

* le nom du réseau Wi-Fi ;
* le mot de passe Wi-Fi ;
* éventuellement un jeton ou un identifiant temporaire d’association.

L’ESP32 enregistre les informations nécessaires puis tente de se connecter au réseau Wi-Fi.

Une fois la connexion réussie, le pot peut communiquer avec le broker MQTT et le backend de l’application.

---

### 5.4 Association au compte

Après la connexion au Wi-Fi, le pot est associé au compte de l’utilisateur.

L’association peut s’appuyer sur :

* un identifiant unique du pot ;
* l’adresse MAC de l’ESP32 ;
* un identifiant généré lors de la fabrication ou de la configuration ;
* un jeton temporaire généré par le backend.

Une fois associé, le pot apparaît dans la liste des plantes ou appareils de l’utilisateur.

---

### 5.5 Fonctionnement quotidien

Après l’installation initiale, le Bluetooth n’est plus utilisé en permanence.

Le fonctionnement normal repose sur :

```text
ESP32
   ↓
Wi-Fi
   ↓
MQTT
   ↓
Backend
   ↓
Base de données
   ↓
Application web
```

Le BLE reste principalement utilisé pour :

* la première configuration ;
* le changement de réseau Wi-Fi ;
* une éventuelle réinitialisation du pot ;
* un mode maintenance.

---

## 6. Fonctionnalités principales

### 6.1 Mesure de l’humidité du sol

Un capteur capacitif d’humidité du sol v1.2 est utilisé.

Le capteur fournit une valeur analogique lue par l’ESP32.

Cette valeur est :

1. récupérée par l’ADC ;
2. comparée aux valeurs de calibration ;
3. convertie en pourcentage ;
4. envoyée au broker MQTT.

Les premières valeurs de calibration retenues sont :

```python
SOIL_DRY = 28000
SOIL_WET = 17000
```

La formule utilisée est :

```python
percent = 100 * (value - SOIL_DRY) / (SOIL_WET - SOIL_DRY)
percent = max(0, min(100, percent))
```

---

### 6.2 Mesure de la luminosité

Le capteur BH1750 mesure la luminosité ambiante en lux.

Il communique avec l’ESP32 grâce au protocole I2C.

L’objectif est de déterminer si la plante reçoit suffisamment de lumière naturelle.

Si la luminosité est insuffisante, le système pourra proposer ou déclencher l’activation des LED de croissance.

---

### 6.3 Détection du niveau d’eau

Un flotteur CVF-SH-BI-491 est prévu pour détecter l’état du réservoir d’eau.

Le système doit pouvoir distinguer au minimum deux états :

```text
Eau disponible
```

et :

```text
Réservoir vide ou niveau insuffisant
```

La pompe ne devra pas être activée si le niveau d’eau est insuffisant.

---

### 6.4 Arrosage

Une pompe submersible 3 V / 5 V doit permettre d’arroser la plante.

La pompe ne peut pas être branchée directement sur un GPIO de l’ESP32.

Elle sera commandée à l’aide d’un étage de puissance comprenant notamment :

* un MOSFET ;
* une résistance de grille ;
* une résistance pull-down ;
* une diode de roue libre ;
* une alimentation adaptée.

L’arrosage pourra être déclenché :

* manuellement depuis l’application ;
* automatiquement selon l’humidité du sol ;
* selon une durée limitée afin d’éviter un arrosage excessif.

---

### 6.5 Éclairage artificiel

Des LED de croissance 1 W ou 3 W doivent fournir un éclairage complémentaire.

Elles pourront être activées :

* manuellement ;
* selon la luminosité mesurée ;
* selon une plage horaire ;
* selon les paramètres associés à la plante.

Les LED nécessitent également un circuit de puissance adapté.

---

### 6.6 Communication Bluetooth Low Energy

Le BLE est utilisé pour la configuration initiale du pot.

Le pot doit pouvoir diffuser un nom identifiable, par exemple :

```text
POCO-A7E4
```

Une application compatible doit pouvoir :

* rechercher les pots disponibles ;
* se connecter à un pot ;
* transmettre les identifiants Wi-Fi ;
* recevoir l’état de la configuration ;
* obtenir l’identifiant du pot ;
* confirmer que l’association est réussie.

Le pot doit disposer d’un mode d’appairage BLE.

Ce mode peut être actif :

* au premier démarrage ;
* lorsqu’aucun réseau Wi-Fi n’est enregistré ;
* après une réinitialisation ;
* après une demande de changement de Wi-Fi.

---

### 6.7 Communication Wi-Fi

Le Wi-Fi est utilisé pour le fonctionnement courant.

Une fois connecté, l’ESP32 peut :

* publier les mesures ;
* recevoir des commandes ;
* signaler son état ;
* communiquer avec le backend par l’intermédiaire du broker MQTT.

L’ESP32 utilise un réseau Wi-Fi 2,4 GHz.

---

### 6.8 Communication MQTT

MQTT est utilisé pour découpler l’ESP32 du site web.

Le pot ne communique pas directement avec l’interface utilisateur.

Il publie ses données sur un broker MQTT, tandis que le backend s’abonne aux topics nécessaires.

L’architecture retenue est :

```text
ESP32
   ↓ publication
Broker MQTT
   ↓ abonnement
Backend
   ↓
Base de données
   ↓
Dashboard
```

Pour les commandes :

```text
Dashboard
   ↓
Backend
   ↓ publication MQTT
Broker MQTT
   ↓ abonnement
ESP32
```

---

## 7. Architecture générale

```text
┌───────────────────────┐
│     Application web   │
│                       │
│ - Compte utilisateur  │
│ - Ajout d’un pot      │
│ - Consultation        │
│ - Commandes           │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│        Backend        │
│                       │
│ - Authentification    │
│ - API                 │
│ - Client MQTT         │
│ - Logique métier      │
└───────┬─────────┬─────┘
        │         │
        │         ▼
        │   ┌───────────────┐
        │   │   Supabase    │
        │   │               │
        │   │ - Utilisateurs│
        │   │ - Plantes     │
        │   │ - Appareils   │
        │   │ - Mesures     │
        │   └───────────────┘
        │
        ▼
┌───────────────────────┐
│      Broker MQTT      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│         ESP32         │
│                       │
│ - MicroPython         │
│ - Wi-Fi               │
│ - BLE                 │
│ - MQTT                │
│ - Capteurs            │
│ - Actionneurs         │
└───────┬───────┬───────┘
        │       │
        ▼       ▼
    Capteurs  Actionneurs
```

---

## 8. Architecture des communications

### Configuration initiale

```text
Téléphone ou application
        │
        │ Bluetooth Low Energy
        ▼
ESP32
        │
        │ Réception du SSID et du mot de passe
        ▼
Connexion au Wi-Fi
```

### Envoi des données

```text
Capteurs
   ↓
ESP32
   ↓
Wi-Fi
   ↓
MQTT
   ↓
Backend
   ↓
Supabase
   ↓
Dashboard
```

### Envoi d’une commande

```text
Utilisateur
   ↓
Dashboard
   ↓
Backend
   ↓
MQTT
   ↓
ESP32
   ↓
Pompe ou LED
```

---

## 9. Matériel utilisé

| Composant                         | Fonction                               |
| --------------------------------- | -------------------------------------- |
| ESP32 DevKit ESP32-D0WD-V3        | Contrôle principal, Wi-Fi et BLE       |
| Capteur capacitif d’humidité v1.2 | Mesure de l’humidité du sol            |
| BH1750                            | Mesure de la luminosité en lux         |
| Flotteur CVF-SH-BI-491            | Détection du niveau d’eau              |
| Pompe submersible 3 V / 5 V       | Arrosage                               |
| Tuyau                             | Acheminement de l’eau                  |
| LED de croissance 1 W / 3 W       | Éclairage artificiel                   |
| Dissipateurs thermiques           | Refroidissement des LED                |
| MOSFET IRLZ34N ou IRLZ44N         | Commande des charges                   |
| Résistance 100 Ω                  | Protection de la grille du MOSFET      |
| Résistance 10 kΩ                  | Pull-down de la grille                 |
| Résistance 4,7 Ω 1 W              | Élément prévu pour le circuit des LED  |
| Diode de roue libre               | Protection lors de l’arrêt de la pompe |
| Module USB-C                      | Alimentation du prototype              |
| Alimentation USB-C 5 V            | Alimentation permanente                |

---

## 10. Technologies utilisées

### Partie embarquée

* ESP32 ;
* MicroPython 1.28.0 ;
* Python ;
* VS Code ;
* extension MicroPico ;
* `esptool` ;
* ADC ;
* I2C ;
* GPIO ;
* BLE ;
* Wi-Fi ;
* MQTT ;
* JSON.

### Communication

* Bluetooth Low Energy pour le provisioning ;
* Wi-Fi 2,4 GHz pour la communication courante ;
* MQTT pour l’échange des messages ;
* broker EMQX pour le prototype.

### Partie web prévue

* application web responsive ;
* système d’authentification ;
* backend MQTT ;
* API ;
* Supabase ;
* dashboard de suivi ;
* historique des mesures ;
* gestion des plantes et des pots.

---

## 11. Configuration MQTT actuelle

### Broker de test

```text
broker.emqx.io
```

### Port

```text
1883
```

### Topic actuel du capteur d’humidité

```text
poco/1hz3c6f7m9a/soil_sensor
```

### Exemple de message JSON

```json
{
  "device_id": "poco-001",
  "humidity_raw": 21186,
  "humidity_percent": 61.95
}
```

Le broker est actuellement public et utilisé uniquement pour les tests.

Une version plus avancée devra prévoir :

* une authentification ;
* des topics privés ;
* une gestion des autorisations ;
* un chiffrement TLS ;
* des identifiants uniques par appareil.

---

## 12. Convention MQTT envisagée

À terme, les topics pourraient être organisés ainsi :

```text
poco/{device_id}/sensors/soil
poco/{device_id}/sensors/light
poco/{device_id}/sensors/water
poco/{device_id}/status
poco/{device_id}/commands/pump
poco/{device_id}/commands/light
poco/{device_id}/commands/sleep
poco/{device_id}/configuration
```

Exemple :

```text
poco/1hz3c6f7m9a/sensors/soil
```

Cette structure permet de séparer :

* les mesures ;
* les états ;
* les commandes ;
* la configuration.

---

## 13. État actuel du projet

### Fonctionnalités déjà réalisées

* installation de MicroPython sur l’ESP32 ;
* configuration de VS Code ;
* installation et utilisation de MicroPico ;
* communication avec le REPL ;
* détection de la carte avec `esptool` ;
* lecture du capteur d’humidité ;
* calibration du capteur ;
* conversion de la valeur en pourcentage ;
* connexion de l’ESP32 au Wi-Fi ;
* vérification de la connectivité Internet ;
* installation de `umqtt.simple` ;
* connexion au broker MQTT ;
* publication d’un message MQTT ;
* publication de la mesure d’humidité ;
* définition d’un topic MQTT propre au projet.

### Fonctionnalités décidées mais non réalisées

* appairage Bluetooth Low Energy ;
* transmission des identifiants Wi-Fi par BLE ;
* association du pot au compte utilisateur ;
* stockage sécurisé de la configuration Wi-Fi ;
* gestion du mode d’appairage ;
* intégration du BH1750 ;
* intégration du flotteur ;
* pilotage de la pompe ;
* pilotage des LED ;
* réception des commandes MQTT ;
* deep sleep ;
* backend MQTT ;
* base de données Supabase ;
* dashboard ;
* notifications.

---

## 14. Contraintes du prototype

Le prototype doit rester adapté :

* au temps disponible ;
* au matériel déjà possédé ;
* aux compétences techniques mobilisables ;
* aux attendus du titre RNCP ;
* à une démonstration pédagogique ;
* à une utilisation en alimentation USB-C permanente.

Le projet n’a pas pour objectif immédiat d’être commercialisé.

Il doit cependant être conçu de façon suffisamment propre pour pouvoir évoluer vers une version plus sécurisée et plus robuste.

---

## 15. Principes de conception

Le projet POCO doit respecter les principes suivants :

### Modularité

Chaque responsabilité doit être isolée dans un module spécifique :

* Wi-Fi ;
* BLE ;
* MQTT ;
* capteur d’humidité ;
* capteur de luminosité ;
* niveau d’eau ;
* pompe ;
* LED ;
* configuration ;
* stockage local.

### Testabilité

Chaque composant doit être testé indépendamment avant l’intégration finale.

### Lisibilité

Le code doit être compréhensible et documenté.

### Réutilisabilité

Les modules doivent pouvoir être réutilisés dans d’autres projets IoT similaires.

### Sécurité

Les informations sensibles ne doivent pas être publiées dans le dépôt Git.

Cela concerne notamment :

* les mots de passe Wi-Fi ;
* les clés API ;
* les identifiants Supabase ;
* les secrets MQTT ;
* les jetons d’association.

### Évolutivité

L’architecture doit permettre d’ajouter ultérieurement :

* plusieurs pots par utilisateur ;
* plusieurs plantes ;
* de nouveaux capteurs ;
* des notifications ;
* des règles d’automatisation ;
* une application mobile.

---

## 16. Organisation de la documentation

```text
docs/
├── 00_Projet.md
├── 01_Installation.md
├── 02_ESP32.md
├── 03_Capteur_Humidite.md
├── 04_MQTT.md
├── 05_Architecture.md
├── 06_API_Web.md
├── 07_Base_de_donnees.md
├── 08_Cablage.md
├── 09_Tests.md
├── 10_BLE.md
├── DECISIONS.md
├── CHANGELOG.md
└── TODO.md
```

### Rôle des fichiers

* `00_Projet.md` : présentation générale du projet ;
* `01_Installation.md` : installation et configuration de l’environnement ;
* `02_ESP32.md` : informations spécifiques à la carte ;
* `03_Capteur_Humidite.md` : branchement, calibration et code ;
* `04_MQTT.md` : broker, topics et messages ;
* `05_Architecture.md` : architecture logicielle et technique ;
* `06_API_Web.md` : documentation du backend et des routes ;
* `07_Base_de_donnees.md` : structure de Supabase ;
* `08_Cablage.md` : schémas électriques et GPIO ;
* `09_Tests.md` : campagnes de tests et résultats ;
* `10_BLE.md` : appairage et configuration initiale ;
* `DECISIONS.md` : décisions techniques et justifications ;
* `CHANGELOG.md` : évolutions du projet ;
* `TODO.md` : tâches restantes.

---

## 17. Résumé de l’architecture retenue

POCO utilise deux moyens de communication complémentaires :

```text
BLE
```

pour :

* détecter le pot ;
* effectuer le premier appairage ;
* transmettre la configuration Wi-Fi ;
* relancer une configuration locale.

Puis :

```text
Wi-Fi + MQTT
```

pour :

* transmettre les mesures ;
* recevoir les commandes ;
* communiquer avec le backend ;
* alimenter le dashboard.

Cette architecture permet de proposer une expérience utilisateur proche de celle d’un véritable objet connecté grand public.
