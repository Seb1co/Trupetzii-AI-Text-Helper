
import edge_tts
from langdetect import detect, LangDetectException

# Vocile disponibile
VOICES = {
    "ro": "ro-RO-AlinaNeural",
    "en": "en-US-AriaNeural",
    "fr": "fr-FR-DeniseNeural",
    "de": "de-DE-KatjaNeural",
    "es": "es-ES-ElviraNeural",
    "it": "it-IT-ElsaNeural"
}

# Cele trei viteze
SPEEDS = {
    "slow": "-25%",
    "medium": "+0%",
    "fast": "+35%"
}


# Detectam limba textului
def detect_language(text):
    try:
        return detect(text)
    except LangDetectException:
        return "en"


# Generam vocea
async def generate_speech(text, speed="medium"):

    if not text or not text.strip():
        raise ValueError("Textul este gol")

    if speed not in SPEEDS:
        speed = "medium"

    language = detect_language(text)

    voice = VOICES.get(
        language,
        "en-US-AriaNeural"
    )

    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=SPEEDS[speed]
    )

    audio_data = bytearray()

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.extend(chunk["data"])

    return bytes(audio_data)

print("SPEECH.PY A FOST INCARCAT")

def test_import():
    return "Importul functioneaza!"