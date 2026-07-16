from machine import ADC, Pin
from time import sleep

soil = ADC(Pin(34))
counter = 0

SOIL_DRY = 28000
SOIL_WET = 17000
NUMBER_OF_READINGS = 5

def read_soil_moisture():
    total = 0

    for _ in range(NUMBER_OF_READINGS):
        total += soil.read_u16()
        sleep(0.2)

    raw_average = total / NUMBER_OF_READINGS

    percent = 100 * (raw_average - SOIL_DRY) / (SOIL_WET - SOIL_DRY)
    percent = max(0, min(100, percent))

    return round(raw_average), round(percent, 2)


raw, humidity = read_soil_moisture()

print(f"Valeur brute moyenne : {raw}")
print(f"Humidité : {humidity}%")