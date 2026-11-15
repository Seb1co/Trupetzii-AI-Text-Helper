import base64

def encrypt(password : str) -> str:
    key = "chbjaskvlkdns"

    pass_bytes = password.encode("utf-8")
    key_bytes = key.encode("utf-8")

    # Aplicăm operația XOR între fiecare byte al textului și cheie
    bytes_criptati = bytearray()
    for i in range(len(pass_bytes)):
        byte_xortat = pass_bytes[i] ^ key_bytes[i % len(key_bytes)]
        bytes_criptati.append(byte_xortat)

    # Codificăm rezultatul în Base64 pentru a returna un string curat
    return base64.b64encode(bytes_criptati).decode("utf-8")