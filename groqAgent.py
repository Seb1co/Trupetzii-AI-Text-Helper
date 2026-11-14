from groq import Groq


def secondChance(prompt):
    groqKey = open("groqKey1.txt","r").read().strip() + open("groqKey2.txt","r").read().strip()
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