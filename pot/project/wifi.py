import network
import time
from config import WIFI_SSID, WIFI_PASSWORD


def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        print("Wi-Fi déjà connecté :", wlan.ifconfig()[0])
        return wlan

    print(f"Connexion au Wi-Fi : {WIFI_SSID}")
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    timeout = 20

    while not wlan.isconnected() and timeout > 0:
        print(".", end="")
        time.sleep(1)
        timeout -= 1

    if not wlan.isconnected():
        raise RuntimeError("Impossible de se connecter au Wi-Fi")

    print("\nWi-Fi connecté")
    print("Adresse IP :", wlan.ifconfig()[0])

    return wlan