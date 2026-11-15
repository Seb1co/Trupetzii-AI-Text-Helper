
import asyncio
from pathlib import Path
from . import voice_engine


async def voice_converter(text : str) -> bytes:

    # Simulam viteza
    speed = "medium"

    try:
        audio = await voice_engine.generate_speech(text, speed)

        #output_file = Path(f"test_audio_{speed}.mp3")
        #output_file.write_bytes(audio)
        return audio

    except Exception as error:
        print(type(error).__name__, "-", error)
        raise


