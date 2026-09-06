import network
import time

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

time.sleep(2)

print("Scan Wi-Fi...")

for wifi in wlan.scan():
    try:
        ssid = wifi[0].decode()
    except:
        ssid = str(wifi[0])

    print(ssid)
    