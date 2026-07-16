import network
import time
import gc
from umqtt.simple import MQTTClient
from machine import ADC, Pin, SPI

# --- Capteur d'humidité du sol ---
capteur = ADC(Pin(34))
capteur.atten(ADC.ATTN_11DB)
VAL_SEC = 4095 
VAL_TREMPE = 1500 

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

# --- LEDs ---
led_blanche = Pin(25, Pin.OUT)  # GPIO25
led_bleue = Pin(33, Pin.OUT)    # GPIO33

# --- Configuration Wi-Fi ---
ssid = 'identifiant wifi'
password = 'mot de passe'

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


def check_mqtt_connection(client):
    try:
        client.ping()
    except:
        print("❌ Connexion MQTT perdue, reconnexion...")
        return connect_mqtt()
    return client


def send_data():
    global mqtt_client
    while True:
        try:
            if not wlan.isconnected():
                print("⚠️ Wi-Fi perdu, reconnexion...")
                connect_wifi()

            mqtt_client = check_mqtt_connection(mqtt_client)

            valeur = capteur.read()
            pourcentage = 100 * (valeur - VAL_SEC) / (VAL_TREMPE - VAL_SEC)
            pourcentage = max(0, min(100, round(pourcentage, 2)))

            luminosity = read_light()
            luminosity_percent = get_light_percent(luminosity)

            print(f"🌱 Humidité du sol : {pourcentage}% (brut : {valeur})")
            print(f"💡 Luminosité : {luminosity_percent}% (brut : {luminosity})")

            # Activation des LEDs
            if pourcentage < 5:
                print("🚨 Humidité trop basse ! Allumage LED bleue.")
                led_bleue.value(1)
            else:
                led_bleue.value(0)

            if luminosity < 500:
                print("🔆 Lumière insuffisante ! Allumage LED blanche.")
                led_blanche.value(1)
            else:
                led_blanche.value(0)

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

            gc.collect()
            time.sleep(1) 

        except Exception as e:
            print(f"💥 Erreur globale : {e}")
            mqtt_client = connect_mqtt()
            time.sleep(5)

send_data()
                                                                              