import network
import time
from config import WIFI_SSID, WIFI_PASSWORD


def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    
    # Remettre le Wi-Fi dans un état propre
    wlan.active(False)
    time.sleep(1)
    
    wlan.active(True)
    time.sleep(1)

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
        status = wlan.status()

        print("\nÉchec connexion Wi-Fi")
        print("Status :", status)

        if status == network.STAT_WRONG_PASSWORD:
            print("Cause : mot de passe incorrect")
        elif status == network.STAT_NO_AP_FOUND:
            print("Cause : réseau Wi-Fi introuvable")
        elif status == network.STAT_CONNECT_FAIL:
            print("Cause : échec de connexion")
        else:
            print("Cause : statut non identifié")

        raise RuntimeError("Impossible de se connecter au Wi-Fi")

    print("\nWi-Fi connecté")
    print("Adresse IP :", wlan.ifconfig()[0])

    return wlan

connect_wifi()