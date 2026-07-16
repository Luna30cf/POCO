import network
import time
import gc
from umqtt.simple import MQTTClient
from machine import ADC, Pin, SPI

# --- Capteur d'humidité ---
capteur = ADC(Pin(34))
capteur.atten(ADC.ATTN_11DB)

# --- Capteur de lumière ---
spi = SPI(1, baudrate=1000000, polarity=0, phase=0, sck=Pin(18), mosi=None, miso=Pin(19))
cs = Pin(5, Pin.OUT)

MAX_LUMINOSITY = 3500

def read_light():
    cs.value(0)
    try:
        light_data = spi.read(2)
    except Exception as e:
        print("Erreur SPI:", e)
        cs.value(1)
        return 0
    cs.value(1)
    if light_data:
        light_value = (light_data[0] << 8) | light_data[1]
        return light_value
    else:
        return 0

def get_light_percent(value):
    percent = (value / MAX_LUMINOSITY) * 100
    return min(round(percent, 2), 100)

# --- Configuration Wi-Fi ---
ssid = 'Identifiant Wifi'
password = 'Mot de passe'

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

def connect_wifi():
    if not wlan.isconnected():
        print(f"Connexion à {ssid} en cours...")
        wlan.connect(ssid, password)
        while not wlan.isconnected():
            print('.', end=" ")
            time.sleep(1)
        print("\n✅ Wi-Fi connecté. IP:", wlan.ifconfig())

connect_wifi()
time.sleep(1)

# --- Configuration MQTT ---
MQTT_BROKER = "votre broker"
MQTT_CLIENT_ID = "un id client unique"
MAC = "l'adresse mac de votre carte"
MQTT_TOPIC_HUM = f"ESP/{MAC}/HUM"
MQTT_TOPIC_LUM = f"ESP/{MAC}/LUM"

def connect_mqtt():
    client = MQTTClient(MQTT_CLIENT_ID, MQTT_BROKER)
    try:
        client.connect()
        print("✅ Connecté au broker MQTT")
        return client
    except Exception as e:
        print("❌ Erreur connexion MQTT:", e)
        return None

mqtt_client = connect_mqtt()
if not mqtt_client:
    raise Exception("Échec de la connexion MQTT")


def send_data():
    global mqtt_client
    while True:
        try:
            if not wlan.isconnected():
                print("⚠️ Wi-Fi perdu, reconnexion...")
                connect_wifi()

            valeur = capteur.read()
            pourcentage = 100 - ((valeur / 4095) * 100)
            pourcentage = round(pourcentage, 2)

            luminosity = read_light()
            luminosity_percent = get_light_percent(luminosity)


            print(f"🌱 Humidité du sol : {pourcentage}% (brut : {valeur})")
            print(f"💡 Luminosité : {luminosity_percent}% (brut : {luminosity})")

            if luminosity < 500:
                print("🔆 Lumière insuffisante ! Activation des LEDs !")


            # Envoi MQTT (séparé pour éviter les crashs)
            try:
                mqtt_client.publish(MQTT_TOPIC_HUM, str(pourcentage))
            except Exception as e:
                print("Erreur MQTT HUM:", e)
            try:
                mqtt_client.publish(MQTT_TOPIC_LUM, str(luminosity_percent))
            except Exception as e:
                print("Erreur MQTT LUM:", e)

            print(f"📤 Données envoyées : HUM={pourcentage}%, LUM={luminosity_percent}%\n")

            gc.collect()  # Libère la mémoire (pour pouvoir continuer à envoyer des données sur une longue durée)
            time.sleep(2)

        except Exception as e:
            print(f"💥 Erreur globale : {e}")
            mqtt_client = connect_mqtt()
            time.sleep(5)


send_data()
