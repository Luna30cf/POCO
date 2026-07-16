from umqtt.simple import MQTTClient

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