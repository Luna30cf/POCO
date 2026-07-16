from machine import Pin, SPI
import time

# config interface SPI
spi = SPI(1, baudrate=1000000, polarity=0, phase=0, sck=Pin(18), mosi=None, miso=Pin(19))
cs = Pin(5, Pin.OUT)  # CS

def read_light():
    cs.value(0)
    light_data = spi.read(2)
    cs.value(1)

    
    light_value = (light_data[0] << 8) | light_data[1]  
    return light_value

while True:
    luminosity = read_light()
    print(f"Luminosité : {luminosity}")

    if luminosity < 500:
        print(":bulb: Lumière insuffisante ! Activation des LEDs !")

    time.sleep(1)