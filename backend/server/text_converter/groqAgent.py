from pathlib import Path
from groq import Groq

KEY_DIR = Path(__file__).resolve().parent

def secondChance(prompt):
    groqKey = (KEY_DIR / "groqKey1.txt").read_text().strip() + (KEY_DIR / "groqKey2.txt").read_text().strip()
    agent = Groq(api_key=groqKey)
    model = "openai/gpt-oss-20b"

    result = agent.chat.completions.create(
        model = model,
        messages = [
                {
                    "role": "user",
                    "content": prompt,
                }
        ],
        ) 
    return result.choices[0].message.content