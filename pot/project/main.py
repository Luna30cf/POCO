from machine import ADC, Pin, I2C
from time import sleep
from wifi import connect_wifi
from umqtt.simple import MQTTClient
import json
import machine

SOIL_DRY = 28000
SOIL_WET = 17000
NUMBER_OF_READINGS = 5

BH1750_ADDR = 0x23
BH1750_MODE = 0x10

MEASUREMENT_INTERVAL = 10

soil = ADC(Pin(34))

i2c = I2C(
    0,
    scl=Pin(22),
    sda=Pin(21),
    freq=100000
)

float_sensor = Pin(
    32,
    Pin.IN,
    Pin.PULL_UP
)

wlan = connect_wifi()

mac = wlan.config("mac")
mac_hex = mac.hex().upper()

device_id = mac[-3:].hex().upper()

print("Adresse MAC complète :", mac_hex)
print("Device ID :", device_id)

client_id = b"poco-" + machine.unique_id().hex().encode()

client = MQTTClient(
    client_id=client_id,
    server="broker.emqx.io",
    port=1883
)

TOPIC_SOIL = f"poco/{device_id}/soil_sensor".encode()
TOPIC_LIGHT = f"poco/{device_id}/light_sensor".encode()
TOPIC_FLOAT = f"poco/{device_id}/float_sensor".encode()

client.connect()

print("Connecté au broker MQTT")


def read_soil():
    total = 0

    for _ in range(NUMBER_OF_READINGS):
        total += soil.read_u16()
        sleep(0.2)

    raw_value = round(total / NUMBER_OF_READINGS)

    percent = 100 * (
        raw_value - SOIL_DRY
    ) / (
        SOIL_WET - SOIL_DRY
    )

    percent = max(
        0,
        min(100, percent)
    )

    return raw_value, round(percent, 2)


def read_light():
    i2c.writeto(
        BH1750_ADDR,
        bytes([BH1750_MODE])
    )

    sleep(0.2)

    data = i2c.readfrom(
        BH1750_ADDR,
        2
    )

    raw_value = (
        data[0] << 8
    ) | data[1]

    lux = raw_value / 1.2

    return round(lux, 2)


def read_float():
    return float_sensor.value()


while True:

    # Humidité
    try:
        raw_value, humidity_percent = read_soil()

        soil_payload = {
            "device_id": device_id,
            "humidity_raw": raw_value,
            "humidity_percent": humidity_percent
        }

        client.publish(
            TOPIC_SOIL,
            json.dumps(soil_payload).encode()
        )

        print(
            "SOIL :",
            json.dumps(soil_payload)
        )

    except Exception as error:
        print(
            "Erreur humidité :",
            error
        )


    # Luminosité
    try:
        light_lux = read_light()

        light_payload = {
            "device_id": device_id,
            "light_lux": light_lux
        }

        client.publish(
            TOPIC_LIGHT,
            json.dumps(light_payload).encode()
        )

        print(
            "LIGHT :",
            json.dumps(light_payload)
        )

    except Exception as error:
        print(
            "Erreur luminosité :",
            error
        )


    # Flotteur
    try:
        water_level = read_float()

        float_payload = {
            "device_id": device_id,
            "water_level": water_level
        }

        client.publish(
            TOPIC_FLOAT,
            json.dumps(float_payload).encode()
        )

        print(
            "FLOAT :",
            json.dumps(float_payload)
        )

    except Exception as error:
        print(
            "Erreur flotteur :",
            error
        )

    print("--------------------")

    sleep(MEASUREMENT_INTERVAL)