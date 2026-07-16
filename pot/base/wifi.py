import network
import time

ssid = 'Identifiant Wifi'
password = 'Mot de passe'

def connectWifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print(f"Try connect to SSID : {ssid}")
        wlan.connect(ssid, password)

        while not wlan.isconnected():
            print('.', end = " ")
            time.sleep_ms(500)

    print("\nWi-Fi Config: ", wlan.ifconfig())
    
connectWifi()