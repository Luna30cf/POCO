from ble import PocoBLE
from wifi import connect_wifi, save_wifi_config
import time

ble = PocoBLE("poco-D2A7E4")

print("En attente de la configuration Wi-Fi par BLE...")

# On attend le SSID + le type de sécurité
while ble.ssid is None or ble.security is None:
    time.sleep(1)

# Réseau ouvert
if ble.security == "open":
    password = ""

# Réseau protégé
elif ble.security == "password":
    print("Réseau protégé : attente du mot de passe...")

    while ble.password is None:
        time.sleep(1)

    password = ble.password

else:
    raise ValueError(
        "Type de sécurité inconnu : {}".format(ble.security)
    )

print("Configuration Wi-Fi reçue")
print("SSID :", ble.ssid)
print("Sécurité :", ble.security)

save_wifi_config(
    ble.ssid,
    password,
    ble.security
)

with open("config.py", "r") as file:
    print("CONFIG ESP32 :")
    print(file.read())

print("Tentative de connexion...")

wlan = connect_wifi(
    ble.ssid,
    password
)

print("Connexion réussie")
print("IP :", wlan.ifconfig()[0])