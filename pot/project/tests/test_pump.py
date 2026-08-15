from machine import Pin
from time import sleep

pump = Pin(33, Pin.OUT, value=0)

print("POMPE OFF")
sleep(2)

print("POMPE ON")
pump.value(1)
sleep(1)

pump.value(0)
print("POMPE OFF")