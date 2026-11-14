
import asyncio
from pathlib import Path

from voice_engine import generate_speech



async def main():
    print("=== TEST TEXT TO SPEECH ===")

    # Simulam textul
    text = """
    Hi! This is a test for the language 
    """

    # Simulam viteza
    speed = "medium"

    print("Text primit de la AI:")
    print(text)

    print("\nViteza selectata:", speed)
    print("\nGenerez vocea...")

    try:
        audio = await generate_speech(text, speed)

        output_file = Path(f"test_audio_{speed}.mp3")
        output_file.write_bytes(audio)

        print("\nSUCCES!")
        print("Fisierul audio a fost salvat:", output_file.resolve())
        print("Dimensiune:", len(audio), "bytes")

    except Exception as error:
        print("\nEROARE:")
        print(type(error).__name__, "-", error)


if __name__ == "__main__":
    asyncio.run(main())
