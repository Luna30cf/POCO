from machine import Pin
from time import sleep

leds = Pin(27, Pin.OUT)

print("LED OFF")
leds.value(0)
sleep(3)

print("LED ON")
leds.value(1)
sleep(3)

print("LED OFF")
leds.value(0)