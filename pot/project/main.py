from machine import ADC, Pin
from time import sleep
from umqtt.simple import MQTTClient
import json
import machine

SOIL_DRY = 28000
SOIL_WET = 17000
NUMBER_OF_READINGS = 5

soil = ADC(Pin(34))

client_id = b"poco-" + machine.unique_id().hex().encode()

client = MQTTClient(
    client_id=client_id,
    server="broker.emqx.io",
    port=1883
)

client.connect()
print("Connecté au broker MQTT")


def read_soil():
    total = 0

    for _ in range(NUMBER_OF_READINGS):
        total += soil.read_u16()
        sleep(0.2)

    raw_value = round(total / NUMBER_OF_READINGS)

    percent = 100 * (raw_value - SOIL_DRY) / (SOIL_WET - SOIL_DRY)
    percent = max(0, min(100, percent))

    return raw_value, round(percent, 2)


while True:
    raw_value, humidity_percent = read_soil()

    data = {
        "device_id": "poco-001",
        "humidity_raw": raw_value,
        "humidity_percent": humidity_percent
    }

    payload = json.dumps(data)

    client.publish(
        b"poco/1hz3c6f7m9a/soil_sensor",
        payload.encode()
    )

    print("Message envoyé :", payload)

    sleep(10)