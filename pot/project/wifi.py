import network
import time

def save_wifi_config(ssid, password, security):

    with open("wifi_config.py", "w") as file:
        file.write(
            'WIFI_SSID = "{}"\n'.format(ssid)
        )

        file.write(
            'WIFI_PASSWORD = "{}"\n'.format(password)
        )

        file.write(
            'WIFI_SECURITY = "{}"\n'.format(security)
        )

    print("Configuration Wi-Fi sauvegardée")

def connect_wifi(ssid, password):
    wlan = network.WLAN(network.STA_IF)

    # Remettre le Wi-Fi dans un état propre
    wlan.active(False)
    time.sleep(1)

    wlan.active(True)
    time.sleep(1)

    if wlan.isconnected():
        print("Wi-Fi déjà connecté :", wlan.ifconfig()[0])
        return wlan

    while not wlan.isconnected():

        print(f"Connexion au Wi-Fi : {ssid}")

        wlan.connect(ssid, password)

        timeout = 20

        while not wlan.isconnected() and timeout > 0:
            print(".", end="")
            time.sleep(1)
            timeout -= 1

        if wlan.isconnected():
            break

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

        print("Nouvelle tentative dans 3 secondes...\n")

        try:
            wlan.disconnect()
        except:
            pass

        time.sleep(3)

    print("\nWi-Fi connecté")
    print("Adresse IP :", wlan.ifconfig()[0])

    return wlan