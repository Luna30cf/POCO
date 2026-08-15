from machine import Pin
from time import sleep

pump = Pin(33, Pin.OUT, value=0)
leds = Pin(27, Pin.OUT)

print("POMPE OFF")
print("LED OFF")
sleep(2)

print("POMPE ON")
pump.value(1)
print("LED ON")
leds.value(1)
sleep(5)

pump.value(0)
print("POMPE OFF")
print("LED OFF")
leds.value(0)