import bluetooth

_SERVICE_UUID = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef0")

_SSID_UUID = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef1")
_PASSWORD_UUID = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef2")
_SECURITY_UUID = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef3")

_FLAG_WRITE = 0x0008

_WIFI_SERVICE = (
    _SERVICE_UUID,
    (
        (_SSID_UUID, _FLAG_WRITE),
        (_PASSWORD_UUID, _FLAG_WRITE),
        (_SECURITY_UUID, _FLAG_WRITE),
    ),
)


class PocoBLE:

    def __init__(self, device_name):

        self.ble = bluetooth.BLE()
        self.ble.active(True)

        self.device_name = device_name

        self.ssid = None
        self.password = None
        self.security = None

        services = self.ble.gatts_register_services(
            (_WIFI_SERVICE,)
        )

        (
            self.ssid_handle,
            self.password_handle,
            self.security_handle
        ) = services[0]

        self.ble.irq(self._irq)

        self._advertise()

        print("BLE actif")
        print("Nom :", self.device_name)


    def _advertise(self):

        name = self.device_name.encode()

        payload = bytearray([
            2,
            0x01,
            0x06,
            len(name) + 1,
            0x09
        ]) + name

        self.ble.gap_advertise(
            100_000,
            adv_data=payload
        )


    def _irq(self, event, data):

        if event == 3:

            conn_handle, attr_handle = data

            if attr_handle == self.ssid_handle:

                value = self.ble.gatts_read(
                    self.ssid_handle
                )

                self.ssid = value.decode()

                print(
                    "SSID reçu :",
                    self.ssid
                )

            elif attr_handle == self.password_handle:

                value = self.ble.gatts_read(
                    self.password_handle
                )

                self.password = value.decode()

                print("Mot de passe reçu")

            elif attr_handle == self.security_handle:

                value = self.ble.gatts_read(
                    self.security_handle
                )

                self.security = value.decode().lower()

                print(
                    "Sécurité reçue :",
                    self.security
                )