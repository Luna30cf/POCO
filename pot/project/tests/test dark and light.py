from machine import Pin, I2C
from time import sleep

BH1750_ADDR = 0x23
CONTINUOUS_HIGH_RES_MODE = 0x10

i2c = I2C(
    0,
    scl=Pin(22),
    sda=Pin(21),
    freq=100000
)

def read_lux():
    # Demande une mesure continue haute résolution
    i2c.writeto(BH1750_ADDR, bytes([CONTINUOUS_HIGH_RES_MODE]))

    sleep(0.2)

    # Le BH1750 renvoie la mesure sur 2 octets
    data = i2c.readfrom(BH1750_ADDR, 2)

    raw_value = (data[0] << 8) | data[1]

    # Conversion donnée brute → lux
    lux = raw_value / 1.2

    return raw_value, lux


for _ in range(10):
    raw, lux = read_lux()

    print(
        "Valeur brute:",
        raw,
        "| Luminosité:",
        round(lux, 2),
        "lux"
    )

    sleep(1)