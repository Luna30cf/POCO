# POCO — Capteur d’humidité du sol

## 1. Objectif du document

Ce document décrit l’intégration du capteur d’humidité du sol utilisé dans le projet POCO.

Il présente :

* le rôle du capteur ;
* son fonctionnement ;
* son branchement ;
* le GPIO utilisé ;
* la lecture analogique ;
* la calibration ;
* la conversion en pourcentage ;
* le filtrage des mesures ;
* la publication MQTT ;
* les tests réalisés ;
* les limites identifiées ;
* les améliorations prévues.

Le capteur d’humidité constitue l’un des composants principaux du projet, car il permet d’estimer si la plante a besoin d’être arrosée.

---

# 2. Capteur utilisé

Le projet utilise un capteur capacitif d’humidité du sol :

```text
Capacitive Soil Moisture Sensor v1.2
```

Ce capteur fournit une sortie analogique qui varie selon l’humidité présente autour de sa partie sensible.

Il est utilisé pour mesurer indirectement la quantité d’eau présente dans le substrat de la plante.

---

# 3. Rôle du capteur dans POCO

Le capteur d’humidité doit permettre de :

* surveiller l’état du sol ;
* afficher un pourcentage d’humidité dans l’application ;
* détecter un sol trop sec ;
* générer une alerte ;
* empêcher un arrosage inutile ;
* participer à une future logique d’arrosage automatique ;
* enregistrer l’évolution de l’humidité dans le temps.

La mesure du capteur ne correspond pas directement à une humidité absolue.

Elle doit être calibrée et interprétée en fonction :

* du capteur ;
* du type de terre ;
* de la plante ;
* de la profondeur d’insertion ;
* de la position du capteur ;
* des conditions environnementales.

---

# 4. Pourquoi utiliser un capteur capacitif

Un capteur capacitif a été préféré à un capteur résistif classique.

Un capteur résistif utilise généralement deux parties métalliques directement exposées à l’humidité.

Avec le temps, ces parties peuvent subir :

* de l’oxydation ;
* de la corrosion ;
* une dégradation progressive ;
* une modification des valeurs mesurées.

Le capteur capacitif mesure une variation de capacité électrique sans utiliser directement deux électrodes métalliques exposées de la même manière.

Il est donc généralement mieux adapté à une utilisation prolongée dans la terre.

Cela ne signifie cependant pas qu’il est totalement étanche ou indestructible.

---

# 5. Limite d’immersion du capteur

Seule la partie sensible prévue pour la mesure doit être placée dans le sol.

La partie supérieure contenant les composants électroniques ne doit pas être immergée.

Le capteur présente généralement une ligne ou une zone séparant :

* la partie pouvant être insérée dans la terre ;
* la partie électronique à maintenir hors du sol humide.

Une immersion excessive peut provoquer :

* un court-circuit ;
* une corrosion du circuit ;
* une mesure instable ;
* une panne définitive.

---

# 6. Branchement

Le capteur possède trois broches principales :

| Broche du capteur | Fonction          |
| ----------------- | ----------------- |
| `VCC`             | Alimentation      |
| `GND`             | Masse             |
| `AO`              | Sortie analogique |

Le branchement retenu est :

| Capteur | ESP32    |
| ------- | -------- |
| `VCC`   | `3V3`    |
| `GND`   | `GND`    |
| `AO`    | `GPIO34` |

Schéma simplifié :

```text
Capteur capacitif            ESP32

VCC  ----------------------> 3V3
GND  ----------------------> GND
AO   ----------------------> GPIO34
```

---

# 7. Pourquoi alimenter le capteur en 3,3 V

Les GPIO de l’ESP32 fonctionnent en logique 3,3 V.

Le capteur est donc alimenté en 3,3 V afin de limiter le risque d’envoyer une tension supérieure à la tension admissible sur l’entrée analogique.

Cette précaution permet également de simplifier le câblage en évitant d’ajouter un pont diviseur de tension.

Avant toute modification de l’alimentation du capteur, il faudra vérifier la tension maximale produite sur sa sortie analogique.

---

# 8. GPIO utilisé

La sortie analogique est connectée au :

```text
GPIO34
```

Le GPIO34 est adapté à cette utilisation car :

* il accepte une entrée analogique ;
* il n’est pas utilisé pour commander un actionneur ;
* il appartient aux broches disponibles de l’ESP32 ;
* il est uniquement utilisable en entrée.

Le GPIO34 ne peut pas être utilisé comme sortie.

Cela ne pose pas de problème ici, car le capteur fournit uniquement une donnée à lire.

---

# 9. Initialisation de l’ADC

Le capteur est lu à l’aide du convertisseur analogique-numérique de l’ESP32.

Code d’initialisation :

```python
from machine import ADC, Pin

soil_adc = ADC(Pin(34))
```

Lecture simple :

```python
raw_value = soil_adc.read_u16()
print(raw_value)
```

La fonction utilisée dans la version actuelle est :

```python
read_u16()
```

Cette fonction retourne une valeur convertie sur une plage allant approximativement de :

```text
0 à 65535
```

---

# 10. Valeur brute

La valeur retournée par le capteur est appelée :

```text
valeur brute
```

Elle ne correspond pas directement à un pourcentage.

Exemple de valeur obtenue :

```text
21186
```

Cette valeur doit être comparée aux valeurs de calibration.

Dans la configuration actuelle :

* une valeur élevée correspond à un sol plus sec ;
* une valeur plus faible correspond à un sol plus humide.

Cette logique doit toujours être vérifiée pour chaque modèle de capteur.

---

# 11. Premier code de lecture

Le code minimal de test est :

```python
from machine import ADC, Pin
import time

soil_adc = ADC(Pin(34))

while True:
    raw_value = soil_adc.read_u16()

    print("Valeur brute :", raw_value)

    time.sleep(1)
```

Ce programme :

1. initialise l’entrée analogique ;
2. lit la valeur du capteur ;
3. affiche le résultat ;
4. attend une seconde ;
5. recommence.

---

# 12. Calibration

La calibration consiste à définir des valeurs de référence représentant :

* un état sec ;
* un état humide.

Les valeurs actuellement retenues sont :

```python
SOIL_DRY = 28000
SOIL_WET = 17000
```

Ces valeurs ont été obtenues lors des premiers tests du capteur.

Elles ne sont pas universelles.

Elles sont valables uniquement pour :

* ce capteur ;
* cette carte ESP32 ;
* cette alimentation ;
* cette méthode de lecture ;
* les conditions des tests réalisés.

---

# 13. Interprétation des références

La valeur :

```python
SOIL_DRY = 28000
```

représente la référence associée à un état considéré comme sec.

La valeur :

```python
SOIL_WET = 17000
```

représente la référence associée à un état considéré comme humide.

La différence entre les deux références est :

```text
28000 - 17000 = 11000
```

Cette plage sert à convertir la valeur brute en pourcentage.

---

# 14. Conversion en pourcentage

La formule utilisée est :

```python
percent = 100 * (value - SOIL_DRY) / (SOIL_WET - SOIL_DRY)
```

Puis le résultat est limité entre 0 et 100 :

```python
percent = max(0, min(100, percent))
```

La fonction complète peut être écrite ainsi :

```python
def raw_to_percent(value):
    percent = 100 * (
        value - SOIL_DRY
    ) / (
        SOIL_WET - SOIL_DRY
    )

    return max(0, min(100, percent))
```

---

# 15. Exemple de conversion

Pour une valeur brute de :

```text
21186
```

le calcul est :

```text
100 × (21186 - 28000) / (17000 - 28000)
```

Soit environ :

```text
61,95 %
```

Exemple en Python :

```python
value = 21186

percent = 100 * (
    value - 28000
) / (
    17000 - 28000
)

percent = max(0, min(100, percent))

print(percent)
```

Résultat attendu :

```text
61.95
```

---

# 16. Limitation entre 0 et 100 %

Le capteur peut parfois produire une valeur située en dehors de la plage de calibration.

Par exemple :

* une valeur supérieure à `SOIL_DRY` ;
* une valeur inférieure à `SOIL_WET`.

Sans limitation, le calcul pourrait produire :

```text
-8 %
```

ou :

```text
112 %
```

Ces valeurs seraient difficiles à afficher à l’utilisateur.

La ligne suivante évite ce problème :

```python
percent = max(0, min(100, percent))
```

Le résultat reste donc toujours compris entre :

```text
0 %
```

et :

```text
100 %
```

---

# 17. Fonction de lecture simple

Une première fonction réutilisable peut être créée :

```python
from machine import ADC, Pin

SOIL_DRY = 28000
SOIL_WET = 17000

soil_adc = ADC(Pin(34))


def read_soil_raw():
    return soil_adc.read_u16()


def raw_to_percent(value):
    percent = 100 * (
        value - SOIL_DRY
    ) / (
        SOIL_WET - SOIL_DRY
    )

    return max(0, min(100, percent))


def read_soil_percent():
    raw_value = read_soil_raw()
    percent = raw_to_percent(raw_value)

    return raw_value, percent
```

Utilisation :

```python
raw_value, percent = read_soil_percent()

print("Valeur brute :", raw_value)
print("Humidité :", percent, "%")
```

---

# 18. Pourquoi filtrer les mesures

Une mesure analogique peut varier légèrement même lorsque le capteur ne bouge pas.

Ces variations peuvent être provoquées par :

* le bruit électrique ;
* l’alimentation ;
* la qualité des câbles ;
* les variations de l’ADC ;
* les perturbations provoquées par la pompe ;
* les perturbations provoquées par les LED ;
* le mouvement du capteur ;
* les différences locales d’humidité dans la terre.

Il est donc préférable de ne pas utiliser une seule lecture isolée.

---

# 19. Moyenne de plusieurs mesures

Une méthode simple consiste à lire plusieurs valeurs puis à calculer une moyenne.

Exemple :

```python
import time


def read_average(adc, samples=10, delay_ms=50):
    total = 0

    for _ in range(samples):
        total += adc.read_u16()
        time.sleep_ms(delay_ms)

    return total // samples
```

Utilisation :

```python
raw_value = read_average(
    soil_adc,
    samples=10,
    delay_ms=50
)
```

Cette méthode permet de réduire une partie des variations rapides.

---

# 20. Fonction complète avec moyenne

```python
from machine import ADC, Pin
import time

SOIL_DRY = 28000
SOIL_WET = 17000

soil_adc = ADC(Pin(34))


def read_average(samples=10, delay_ms=50):
    total = 0

    for _ in range(samples):
        total += soil_adc.read_u16()
        time.sleep_ms(delay_ms)

    return total // samples


def raw_to_percent(value):
    percent = 100 * (
        value - SOIL_DRY
    ) / (
        SOIL_WET - SOIL_DRY
    )

    return max(0, min(100, percent))


def read_soil():
    raw_value = read_average()
    percent = raw_to_percent(raw_value)

    return {
        "raw": raw_value,
        "percent": round(percent, 2)
    }
```

Exemple de résultat :

```python
{
    "raw": 21186,
    "percent": 61.95
}
```

---

# 21. Médiane

Une autre méthode possible consiste à utiliser la médiane.

La médiane permet de mieux éliminer une valeur très différente des autres.

Exemple :

```python
def read_median(samples=9):
    values = []

    for _ in range(samples):
        values.append(soil_adc.read_u16())

    values.sort()

    middle = len(values) // 2

    return values[middle]
```

Cette méthode peut être intéressante si une mesure parasite apparaît ponctuellement.

Pour le premier prototype, la moyenne reste suffisante et plus simple à expliquer.

---

# 22. Fréquence de mesure

Il n’est pas nécessaire de lire et d’envoyer l’humidité du sol plusieurs fois par seconde.

L’humidité du sol évolue généralement lentement.

Une mesure peut être réalisée, par exemple :

* toutes les 30 secondes pendant les tests ;
* toutes les minutes ;
* toutes les 5 minutes ;
* toutes les 15 minutes dans une version plus avancée.

Une fréquence trop élevée :

* augmente inutilement le nombre de messages MQTT ;
* augmente le volume de données stockées ;
* consomme plus de ressources ;
* rend les graphiques plus difficiles à lire ;
* n’apporte pas forcément d’information utile.

Pour les tests, une fréquence courte peut être conservée afin d’observer rapidement les variations.

---

# 23. Structure du module

Le capteur pourra être isolé dans le fichier :

```text
sensors/soil.py
```

Exemple d’organisation :

```python
from machine import ADC, Pin
import time


class SoilSensor:
    def __init__(
        self,
        pin_number,
        dry_value,
        wet_value,
        samples=10
    ):
        self.adc = ADC(Pin(pin_number))
        self.dry_value = dry_value
        self.wet_value = wet_value
        self.samples = samples

    def read_raw(self):
        total = 0

        for _ in range(self.samples):
            total += self.adc.read_u16()
            time.sleep_ms(50)

        return total // self.samples

    def to_percent(self, raw_value):
        percent = 100 * (
            raw_value - self.dry_value
        ) / (
            self.wet_value - self.dry_value
        )

        return max(0, min(100, percent))

    def read(self):
        raw_value = self.read_raw()
        percent = self.to_percent(raw_value)

        return {
            "raw": raw_value,
            "percent": round(percent, 2)
        }
```

Utilisation :

```python
from sensors.soil import SoilSensor

soil_sensor = SoilSensor(
    pin_number=34,
    dry_value=28000,
    wet_value=17000
)

measurement = soil_sensor.read()

print(measurement)
```

---

# 24. Format des données

La mesure doit conserver deux informations :

* la valeur brute ;
* le pourcentage calculé.

Exemple :

```json
{
  "humidity_raw": 21186,
  "humidity_percent": 61.95
}
```

La valeur brute est utile pour :

* diagnostiquer le capteur ;
* recalibrer le système ;
* comparer les mesures ;
* détecter une dérive ;
* vérifier la formule.

Le pourcentage est plus adapté à l’affichage utilisateur.

---

# 25. Publication MQTT actuelle

Le premier topic utilisé pendant les tests était :

```text
poco/1hz3c6f7m9a/soil_sensor
```

L’identifiant contenu dans ce topic est temporaire.

Il devra être remplacé par l’identifiant définitif du pot.

La future structure envisagée est :

```text
poco/{device_id}/sensors/soil
```

Exemple :

```text
poco/e4a7d2/sensors/soil
```

---

# 26. Message JSON actuel

Exemple de message :

```json
{
  "device_id": "poco-001",
  "humidity_raw": 21186,
  "humidity_percent": 61.95
}
```

Ce format devra évoluer pour utiliser l’identifiant réel dérivé de la carte.

Exemple futur :

```json
{
  "device_id": "e4a7d2",
  "humidity_raw": 21186,
  "humidity_percent": 61.95
}
```

---

# 27. Publication MQTT en MicroPython

Exemple conceptuel :

```python
import json


def publish_soil_measurement(
    mqtt_client,
    topic,
    device_id,
    measurement
):
    payload = {
        "device_id": device_id,
        "humidity_raw": measurement["raw"],
        "humidity_percent": measurement["percent"]
    }

    mqtt_client.publish(
        topic.encode(),
        json.dumps(payload).encode()
    )
```

Utilisation :

```python
measurement = soil_sensor.read()

publish_soil_measurement(
    mqtt_client=client,
    topic="poco/e4a7d2/sensors/soil",
    device_id="e4a7d2",
    measurement=measurement
)
```

---

# 28. Ajout d’un horodatage

Dans une version plus avancée, le message pourra contenir un horodatage.

Exemple :

```json
{
  "device_id": "e4a7d2",
  "humidity_raw": 21186,
  "humidity_percent": 61.95,
  "timestamp": 1784563200
}
```

Cependant, l’ESP32 doit disposer d’une heure fiable.

Deux solutions sont possibles :

* synchroniser l’heure avec un serveur NTP ;
* laisser le backend ajouter l’horodatage lors de la réception.

Pour le prototype, l’horodatage côté backend peut être plus simple et plus fiable.

---

# 29. Classification de l’humidité

Le pourcentage peut être transformé en un état textuel.

Exemple :

```python
def classify_soil(percent):
    if percent < 25:
        return "dry"

    if percent < 45:
        return "low"

    if percent < 75:
        return "good"

    return "wet"
```

Exemple de message :

```json
{
  "device_id": "e4a7d2",
  "humidity_raw": 21186,
  "humidity_percent": 61.95,
  "humidity_status": "good"
}
```

Ces seuils sont uniquement des exemples.

Ils devront être adaptés au type de plante.

---

# 30. Seuils personnalisés par plante

Toutes les plantes n’ont pas les mêmes besoins.

Il n’est donc pas recommandé d’utiliser un seuil unique pour toutes les plantes.

La base de données pourra contenir :

* un seuil minimal ;
* un seuil maximal ;
* un seuil d’alerte ;
* un seuil d’arrosage automatique.

Exemple :

```json
{
  "minimum_humidity": 35,
  "maximum_humidity": 70,
  "watering_threshold": 30
}
```

Ces valeurs seront associées à la plante et non directement codées dans le capteur.

---

# 31. Exemple d’interprétation

Exemple pour une plante donnée :

|   Humidité | État        |
| ---------: | ----------- |
|   0 à 24 % | Très sec    |
|  25 à 39 % | Sec         |
|  40 à 69 % | Correct     |
|  70 à 89 % | Humide      |
| 90 à 100 % | Très humide |

Cette grille est illustrative.

Elle ne doit pas être considérée comme une recommandation botanique universelle.

---

# 32. Utilisation pour l’arrosage automatique

Le capteur pourra participer à une logique d’arrosage automatique.

Exemple conceptuel :

```python
if humidity_percent < watering_threshold:
    if water_is_available():
        water_plant()
```

Cette logique ne doit pas se limiter à une seule condition.

Elle doit également vérifier :

* le niveau du réservoir ;
* la durée depuis le dernier arrosage ;
* la durée maximale de pompe ;
* le mode automatique ;
* l’état du système ;
* la validité de la mesure ;
* la connexion ou les paramètres locaux.

---

# 33. Hystérésis

Sans précaution, un système automatique peut s’activer et se désactiver trop souvent autour d’un seuil.

Exemple :

```text
29,9 % → arrosage
30,1 % → arrêt
29,8 % → arrosage
```

Pour éviter cela, une hystérésis peut être utilisée.

Exemple :

* démarrer l’arrosage sous 30 % ;
* ne pas considérer l’humidité comme revenue à un niveau correct avant 40 %.

Cependant, l’arrosage ne devra pas forcément fonctionner jusqu’à ce que le capteur atteigne immédiatement 40 %, car l’eau met du temps à se diffuser dans la terre.

Une durée limitée de pompe reste plus sûre.

---

# 34. Délai après arrosage

Après un arrosage, la mesure peut mettre du temps à évoluer.

L’eau doit se diffuser dans le substrat jusqu’à la zone du capteur.

Il est donc préférable de :

1. activer la pompe pendant une courte durée ;
2. arrêter la pompe ;
3. attendre ;
4. reprendre une mesure ;
5. décider si une nouvelle action est nécessaire.

Exemple conceptuel :

```text
Pompe activée 2 secondes
        ↓
Pompe arrêtée
        ↓
Attente 30 secondes
        ↓
Nouvelle mesure
```

Les durées définitives devront être déterminées par des tests.

---

# 35. Détection d’une mesure incohérente

Une mesure peut être considérée comme suspecte si :

* elle change trop brutalement ;
* elle reste bloquée ;
* elle vaut constamment 0 ;
* elle vaut constamment 65535 ;
* elle sort largement des valeurs habituelles ;
* le capteur est débranché.

Exemple :

```python
def is_measurement_valid(raw_value):
    return 1000 < raw_value < 64000
```

Cette plage est uniquement indicative.

Elle devra être adaptée aux valeurs réellement observées.

---

# 36. Détection d’un capteur débranché

Un capteur débranché peut provoquer :

* une valeur instable ;
* une valeur extrême ;
* une entrée flottante ;
* une série incohérente de mesures.

Une détection simple peut s’appuyer sur :

* plusieurs lectures ;
* une vérification des extrêmes ;
* une comparaison avec la dernière mesure ;
* un statut d’erreur envoyé au backend.

Exemple de statut :

```json
{
  "device_id": "e4a7d2",
  "sensor": "soil",
  "status": "error",
  "error": "invalid_reading"
}
```

---

# 37. Effet de la pompe sur la mesure

La pompe peut générer des perturbations électriques.

Pendant son fonctionnement, elle peut provoquer :

* une chute temporaire de tension ;
* du bruit sur l’alimentation ;
* une variation de la lecture ADC ;
* un redémarrage de l’ESP32 si l’alimentation est insuffisante.

Pour limiter ces problèmes :

* la pompe doit être commandée par un MOSFET ;
* une diode de roue libre doit être installée ;
* l’alimentation doit fournir suffisamment de courant ;
* les masses doivent être communes ;
* les câbles de puissance et de mesure doivent être séparés autant que possible ;
* la lecture du capteur peut être suspendue pendant l’activation de la pompe.

---

# 38. Effet des LED sur la mesure

Les LED de puissance peuvent également perturber le système.

Elles peuvent provoquer :

* une consommation importante ;
* une chauffe ;
* des variations d’alimentation ;
* du bruit en cas de commande PWM.

Il faudra comparer les mesures :

* LED éteintes ;
* LED allumées ;
* pompe éteinte ;
* pompe allumée.

Ces tests permettront de déterminer si un filtrage ou un câblage différent est nécessaire.

---

# 39. Position du capteur dans le pot

Le capteur doit être placé de façon stable.

Il doit éviter :

* la proximité immédiate de l’arrivée d’eau ;
* le contact avec le fond du pot ;
* une position trop proche de la paroi ;
* une zone constamment détrempée ;
* une zone qui sèche beaucoup plus vite que le reste du substrat.

Il peut être placé :

* à proximité de la zone racinaire ;
* à une profondeur constante ;
* à une distance raisonnable de la pompe ou du tuyau.

La position devra être répétable pour obtenir des mesures comparables.

---

# 40. Influence de l’arrivée d’eau

Si l’eau est versée directement sur le capteur, la mesure peut augmenter brutalement sans représenter l’humidité générale du pot.

Le tuyau d’arrosage devra donc être positionné à une certaine distance du capteur.

Le fonctionnement attendu est :

```text
Sortie du tuyau
       ↓
Humidification du substrat
       ↓
Diffusion de l’eau
       ↓
Évolution progressive de la mesure
```

---

# 41. Procédure de calibration recommandée

Une calibration plus rigoureuse peut suivre les étapes suivantes.

## Étape 1 — Stabiliser le montage

* brancher le capteur ;
* utiliser le câblage définitif ;
* conserver la même alimentation ;
* immobiliser les fils ;
* vérifier que le capteur répond.

## Étape 2 — Mesurer une référence sèche

* laisser le capteur à l’air libre ou dans un substrat très sec ;
* attendre la stabilisation ;
* relever plusieurs dizaines de valeurs ;
* calculer une moyenne ;
* enregistrer la valeur comme référence sèche.

## Étape 3 — Mesurer une référence humide

* placer la partie sensible dans un environnement très humide ;
* ne pas immerger l’électronique ;
* attendre la stabilisation ;
* relever plusieurs valeurs ;
* calculer une moyenne ;
* enregistrer la référence humide.

## Étape 4 — Tester dans le vrai substrat

* placer le capteur dans la terre prévue ;
* mesurer après arrosage ;
* mesurer pendant le séchage ;
* observer l’évolution sur plusieurs heures ou plusieurs jours.

## Étape 5 — Ajuster

* modifier `SOIL_DRY` si le 0 % est incohérent ;
* modifier `SOIL_WET` si le 100 % est incohérent ;
* vérifier que les valeurs intermédiaires restent progressives.

---

# 42. Tableau de calibration à compléter

| Situation                    |    Mesure 1 |    Mesure 2 |    Mesure 3 |     Moyenne |
| ---------------------------- | ----------: | ----------: | ----------: | ----------: |
| Capteur à l’air              | À compléter | À compléter | À compléter | À compléter |
| Terre très sèche             | À compléter | À compléter | À compléter | À compléter |
| Terre légèrement humide      | À compléter | À compléter | À compléter | À compléter |
| Terre humide                 | À compléter | À compléter | À compléter | À compléter |
| Eau ou référence très humide | À compléter | À compléter | À compléter | À compléter |

Les valeurs actuellement utilisées restent :

```text
Référence sèche : 28000
Référence humide : 17000
```

Elles devront être confirmées avec le montage définitif.

---

# 43. Tests réalisés

Les éléments suivants ont été validés :

* le capteur est alimenté ;
* la sortie analogique est lue par l’ESP32 ;
* le GPIO34 fonctionne ;
* les valeurs varient selon l’humidité ;
* une calibration initiale a été définie ;
* la conversion en pourcentage fonctionne ;
* la mesure peut être transformée en JSON ;
* la mesure peut être publiée sur MQTT.

Exemple validé :

```json
{
  "device_id": "poco-001",
  "humidity_raw": 21186,
  "humidity_percent": 61.95
}
```

---

# 44. Tests restant à effectuer

Les tests suivants restent à réaliser :

* calibration complète dans le vrai pot ;
* mesure dans une terre totalement sèche ;
* mesure après arrosage ;
* suivi du séchage sur plusieurs jours ;
* mesure avec la pompe active ;
* mesure avec les LED actives ;
* détection du capteur débranché ;
* stabilité après plusieurs heures ;
* comparaison entre moyenne et mesure simple ;
* comparaison de plusieurs positions dans le pot ;
* validation des seuils par type de plante.

---

# 45. Plan de test fonctionnel

## Test 1 — Lecture à l’air

Objectif :

* vérifier que la valeur reste relativement stable ;
* obtenir une première référence sèche.

Résultat attendu :

* valeur élevée ;
* variations limitées.

## Test 2 — Contact avec un environnement humide

Objectif :

* vérifier que la valeur diminue ;
* confirmer le sens de variation.

Résultat attendu :

* valeur plus faible que dans l’air.

## Test 3 — Terre sèche

Objectif :

* vérifier le comportement dans le substrat réel.

Résultat attendu :

* pourcentage faible.

## Test 4 — Terre arrosée

Objectif :

* observer l’évolution après arrosage.

Résultat attendu :

* diminution de la valeur brute ;
* augmentation du pourcentage.

## Test 5 — Stabilité

Objectif :

* observer les variations sans modifier l’environnement.

Résultat attendu :

* faible écart entre les mesures.

---

# 46. Exemple de journal de test

| Date        | Situation             | Valeur brute | Pourcentage | Observation     |
| ----------- | --------------------- | -----------: | ----------: | --------------- |
| À compléter | Air libre             |  À compléter | À compléter | Référence sèche |
| À compléter | Terre sèche           |  À compléter | À compléter |                 |
| À compléter | Terre humide          |  À compléter | À compléter |                 |
| À compléter | Après arrosage        |  À compléter | À compléter |                 |
| À compléter | 30 min après arrosage |  À compléter | À compléter |                 |

Ce tableau pourra être repris dans :

```text
docs/09_Tests.md
```

---

# 47. Limites du pourcentage affiché

Le pourcentage produit par POCO est une valeur normalisée.

Il ne s’agit pas nécessairement d’un véritable pourcentage volumique d’eau dans le sol.

Il représente plutôt :

```text
la position de la mesure entre une référence sèche et une référence humide
```

Le pourcentage doit donc être présenté comme :

```text
humidité estimée du sol
```

et non comme une mesure scientifique absolue.

---

# 48. Influence du type de terre

Deux substrats différents peuvent produire des mesures différentes pour une quantité d’eau similaire.

Les résultats peuvent varier selon :

* la densité du sol ;
* la composition ;
* la présence de sable ;
* la présence de fibres ;
* la présence de billes d’argile ;
* la salinité ;
* la quantité de matière organique.

Une calibration réalisée dans un substrat ne sera pas forcément parfaite dans un autre.

---

# 49. Vieillissement du capteur

Même un capteur capacitif peut évoluer dans le temps.

Les causes possibles sont :

* l’humidité permanente ;
* la corrosion des parties non protégées ;
* le vieillissement des composants ;
* les variations de température ;
* les contraintes mécaniques ;
* les infiltrations d’eau.

Il pourra être utile de recalibrer le capteur périodiquement.

---

# 50. Gestion des erreurs dans le code

La lecture doit être entourée d’une gestion d’erreur.

Exemple :

```python
def safe_read_soil(sensor):
    try:
        measurement = sensor.read()

        return {
            "success": True,
            "data": measurement
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }
```

Le programme principal pourra ensuite décider :

* de relancer la mesure ;
* d’envoyer une erreur ;
* d’ignorer temporairement la valeur ;
* de bloquer l’arrosage automatique.

---

# 51. Comportement en cas d’erreur

Si la mesure est invalide :

* aucune décision d’arrosage automatique ne doit être prise ;
* la pompe doit rester arrêtée ;
* le système doit signaler l’erreur ;
* la dernière valeur valide peut rester affichée avec un indicateur ;
* le backend peut enregistrer l’erreur.

Exemple de message :

```json
{
  "device_id": "e4a7d2",
  "sensor": "soil",
  "status": "error",
  "error_code": "SOIL_SENSOR_INVALID"
}
```

---

# 52. Séparation entre mesure et décision

Le module du capteur doit uniquement :

* lire la valeur ;
* filtrer la valeur ;
* convertir la valeur ;
* retourner un résultat.

Il ne doit pas décider directement d’activer la pompe.

La décision d’arrosage doit être placée dans une logique séparée.

Exemple :

```text
soil.py
    ↓
retourne la mesure
    ↓
watering_service.py
    ↓
analyse les règles
    ↓
pump.py
```

Cette séparation améliore :

* la lisibilité ;
* les tests ;
* la maintenance ;
* la réutilisation ;
* la sécurité.

---

# 53. Exemple d’architecture logicielle

```text
sensors/soil.py
        │
        ▼
Lecture et conversion
        │
        ▼
main.py ou measurement_service.py
        │
        ├── Publication MQTT
        │
        └── Transmission à la logique d’arrosage
                         │
                         ▼
                watering_service.py
                         │
                         ▼
                actuators/pump.py
```

---

# 54. Checklist du capteur

## Matériel

* [x] Capteur capacitif v1.2 disponible
* [x] Capteur connecté au GPIO34
* [x] Alimentation 3,3 V testée
* [x] Masse commune
* [ ] Position définitive dans le pot choisie
* [ ] Partie électronique protégée de l’humidité
* [ ] Câblage final fixé

## Lecture

* [x] Lecture ADC fonctionnelle
* [x] `read_u16()` utilisé
* [x] Valeur brute affichée
* [x] Variation selon l’humidité observée
* [ ] Détection du capteur débranché
* [ ] Filtrage final validé

## Calibration

* [x] Référence sèche initiale définie
* [x] Référence humide initiale définie
* [x] Conversion en pourcentage réalisée
* [ ] Calibration dans le vrai substrat
* [ ] Calibration après montage final
* [ ] Seuils adaptés à la plante

## Communication

* [x] JSON créé
* [x] Publication MQTT validée
* [ ] Topic définitif appliqué
* [ ] Identifiant temporaire remplacé
* [ ] Erreurs publiées

## Automatisation

* [ ] Seuil d’alerte défini
* [ ] Seuil d’arrosage défini
* [ ] Hystérésis étudiée
* [ ] Délai après arrosage défini
* [ ] Blocage en cas de mesure invalide
* [ ] Tests avec la pompe réalisés

---

# 55. État actuel

À ce stade :

- [x] le capteur capacitif est connecté ;  
- [x] le GPIO34 est utilisé ;  
- [x] la lecture analogique fonctionne ;  
- [x] la valeur évolue selon l’humidité ;   
- [x] une calibration initiale a été définie ;  
- [x] les références actuelles sont `28000` et `17000` ;  
- [x] la conversion en pourcentage fonctionne ;  
- [x] une mesure de `21186` correspond à environ `61,95 %` ;  
- [x] la donnée peut être envoyée en JSON sur MQTT.  
- [ ] confirmer les valeurs de calibration ;  
- [ ] effectuer les tests dans le pot réel ;  
- [ ] ajouter une moyenne de plusieurs mesures ;  
- [ ] détecter les mesures incohérentes ;  
- [ ] remplacer l’identifiant MQTT temporaire ;  
- [ ] publier sur le topic définitif ;  
- [ ] définir les seuils selon la plante ;  
- [ ] tester l’évolution après arrosage ;   
- [ ] intégrer la mesure à la logique de sécurité de la pompe.  
