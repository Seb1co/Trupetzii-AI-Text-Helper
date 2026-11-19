from pathlib import Path
from google import genai
from . import groqAgent

KEY_DIR = Path(__file__).resolve().parent

def runModel(prompt):
    try:
        gemKey = (KEY_DIR / "gemKey1.txt").read_text().strip() + (KEY_DIR / "gemKey2.txt").read_text().strip()
        model = "gemini-3.5-flash-lit"
        agent = genai.Client(api_key=gemKey)
        result = agent.models.generate_content(
                model = model,
                contents = prompt
                )
        return result.text
    except Exception as e:
        try:
            return groqAgent.secondChance(prompt)
        except Exception as e:
            print(e)



#retuseza texul recunoscut de PaddleOCR
def correctText(text):
    c = f"""You will be given a text that has missing or misplaced characters,
    or even characters replaced with other characters. 
    Correct the text and respond with only the corrected version, NOTHING ELSE.
    The text is:
    {text};
    Please write in the same language as the text."""

    corrected = runModel(c)
    return corrected if isinstance(corrected, str) else text

def summarizeText(text):
    c = f"""You will be given a text. Summarize it's content(make it shorter in length and easier to understand).
    Respond with only the summarized version, NOTHING ELSE.
    The text is: 
    {text};
    Please write in the same language as the text."""

    summarized = runModel(c)
    return summarized


def testMaker(text):
    c = f"""You will be given a text. Realize a test based on the text, composed of 10 questions.
    The test should have the format:
    1. First question
    a) First answer
    b) Second answer
    c) Third answer
    d) Forth answer
    2. Second question
    a) First answer
    b) Second answer
    c) Third answer 
    d) Forth answer
    ...
    DO NOT LEAVE AN EMPTY LINE BETWEEN QUESTIONS.
    Place a value of truth next to each question, for example:
    a) First answer (True)
    b) Second answer (False)
    c) Third answer (False)
    d) Forth answer (False)
    Only one answer can be true. The true answer should have a random position(either a,b,c,d).
    Make sure to follow the exact format, the value of truth should be in parethesis: ()

    Respond with only the test you made based on the text, NOTHING ELSE. 
    The text on which the test has to be based on is:
    {text}
    """

    testString = runModel(c)
    try:
        testLines = testString.splitlines()
        test = {}
        for i in range(len(testLines)):
            print(testLines[i])
            if(i%5==0):
                question = testLines[i]
                answers = {}
            else:
                split = testLines[i].split("(", 1)
                answer = split[0]

                if(split[1].replace(")","") == "True"):
                    valueOfTruth = True
                else:
                    valueOfTruth = False
                
                answers[answer] = valueOfTruth
                
                if(i%5==4):
                    test[question] = answers
        return test
    except Exception as e:
        pass
    #returneaza un dictionar de tip question : answer:valueOfTruth(True/False)
