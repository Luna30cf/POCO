import bluetooth
import time

DEVICE_NAME = "poco-D2A7E4"

ble = bluetooth.BLE()
ble.active(True)

payload = bytearray([
    2, 0x01, 0x06,
    len(DEVICE_NAME) + 1,
    0x09
]) + DEVICE_NAME.encode()

ble.gap_advertise(
    100_000,
    adv_data=payload
)

print("BLE actif")
print("Nom :", DEVICE_NAME)

while True:
    time.sleep(1)