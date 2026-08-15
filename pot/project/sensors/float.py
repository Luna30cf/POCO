from machine import Pin
from time import sleep

float = Pin(32, Pin.IN, Pin.PULL_UP)

while True:
    value = float.value()

    print("Float value :", value)

    sleep(1)