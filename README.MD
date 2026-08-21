# 🌱 POCO – Pot connecté intelligent

POCO est un prototype de **pot de fleurs connecté** développé dans le cadre du titre **RNCP36463 – Concepteur développeur d’applications numériques**.

L'objectif du projet est de faciliter l'entretien des plantes d'intérieur grâce à la collecte de données environnementales, leur analyse et la commande d'actionneurs depuis une application Web.

---

## Fonctionnalités

POCO permet notamment de :

- mesurer l'humidité du sol ;
- mesurer la luminosité ambiante ;
- détecter le niveau d'eau du réservoir ;
- transmettre les mesures via MQTT ;
- enregistrer les données dans PostgreSQL ;
- consulter les informations depuis un dashboard Web ;
- analyser les besoins de la plante ;
- commander une pompe d'arrosage ;
- commander une LED de croissance ;
- empêcher l'arrosage lorsque le réservoir est vide ;
- rechercher et associer une espèce végétale via l'API Perenual ;
- gérer l'authentification et l'accès aux données de chaque utilisateur.

---

## Architecture générale

Le fonctionnement de POCO repose sur la chaîne suivante :

ESP32  
↓  
Capteurs et actionneurs  
↓  
MQTT  
↓  
Backend Node.js / Express  
↓  
Supabase / PostgreSQL  
↓  
API REST authentifiée  
↓  
Dashboard Web

---

## Technologies utilisées

### IoT

- ESP32 DevKit
- MicroPython
- MQTT
- Capteur capacitif d'humidité du sol
- BH1750
- Capteur de niveau d'eau
- Pompe 5 V
- LED de croissance

### Backend

- Node.js
- Express
- MQTT
- API REST
- API Perenual

### Base de données et authentification

- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

### Frontend

- HTML
- CSS
- JavaScript
- Interface responsive

### Déploiement et outils

- Render
- Git / GitHub
- Trello
- VS Code
- KiCad

---

## Sécurité

Plusieurs mécanismes de sécurité sont intégrés à POCO :

- authentification des utilisateurs ;
- protection des routes du backend ;
- contrôle de propriété des pots ;
- politiques RLS dans PostgreSQL/Supabase ;
- validation des données reçues ;
- variables sensibles stockées hors du dépôt Git ;
- contrôle du niveau d'eau avant activation de la pompe ;
- seconde vérification physique du flotteur directement par l'ESP32.

---

## Structure du backend

Le backend est organisé en plusieurs composants afin de séparer les responsabilités :

- `routes/` : définition des routes de l'API ;
- `controllers/` : traitement des requêtes HTTP ;
- `services/` : logique d'accès aux données ;
- `middlewares/` : authentification et contrôles intermédiaires ;
- `config/` : configuration des services ;
- `server.js` : démarrage et configuration principale du serveur.

---

## Communication MQTT

Chaque pot possède un identifiant matériel dérivé de l'adresse MAC Wi-Fi de son ESP32.

Exemple :

`poco-D2A7E4`

Les principales données sont publiées sur des topics MQTT dédiés :

- `poco/D2A7E4/soil_sensor`
- `poco/D2A7E4/light_sensor`
- `poco/D2A7E4/float_sensor`

Le backend peut utiliser des topics génériques afin de prendre en charge plusieurs dispositifs.

---

## État du projet

**POCO V1 – Feature freeze**

Les principaux parcours de la V1 sont fonctionnels :

Capteurs → ESP32 → MQTT → Backend → PostgreSQL → Dashboard

et :

Dashboard → Backend → MQTT → ESP32 → Actionneurs

Le développement fonctionnel de la V1 est figé afin de privilégier les tests, la documentation et la validation du projet.

---

## Perspectives

Plusieurs évolutions sont envisagées pour une version ultérieure :

- application mobile ;
- provisioning Wi-Fi via BLE ;
- association autonome d'un nouveau pot ;
- notifications ;
- automatisations supplémentaires.

Ces fonctionnalités ne font pas partie du périmètre de POCO V1.

---

## Auteur

Luna COLOMBAN-FERNANDEZ

Projet POCO réalisé dans le cadre de la préparation du titre :

**RNCP36463 – Concepteur développeur d'applications numériques**