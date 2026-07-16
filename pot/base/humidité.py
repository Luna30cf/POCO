from machine import ADC, Pin
import time

capteur = ADC(Pin(34))
capteur.atten(ADC.ATTN_11DB)

VAL_SEC = 4095
VAL_TREMPE = 1500

while True:
    valeur = capteur.read()
    
    pourcentage = 100 * (valeur - VAL_SEC) / (VAL_TREMPE - VAL_SEC)
    pourcentage = max(0, min(100, pourcentage))
    
    print(f"Valeur brute: {valeur} | Humidité: {round(pourcentage, 2)}%")
    time.sleep(1)