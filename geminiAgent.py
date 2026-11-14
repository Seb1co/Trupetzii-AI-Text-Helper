from google import genai


def runModel(prompt):
    try:
        gemKey = open("geminiKey.txt","r").read().strip()
        model = "gemini-3.8-flash"
        agent = genai.Client(api_key=gemKey)
        result = agent.models.generate_content(
                model = model,
                contents = prompt
                )
        return result
    except Exception as e:
        pass



#retuseza texul recunoscut de PaddleOCR
def correctText(text):
    c = f"""You will be given a text that has missing or misplaced characters,
    or even characters replaced with other characters. 
    Correct the text and respond with only the corrected version, NOTHING ELSE.
    The text is:
    {text}"""

    corrected = runModel(c)
    return corrected

def summarizeText(text):
    c = f"""You will be given a text. Summarize it's content(make it shorter in length and easier to understand).
    Respond with only the summarized version, NOTHING ELSE.
    The text is: 
    {text}"""

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
    
    Place a value of truth next to each question, for example:
    a) First answer (True)
    b) Second answer (False)
    c) Third answer (False)
    d) Forth answer (False)
    Only one answer can be true. The true answer should have a random position(either a,b,c,d).

    Respond with only the test you made based on the text, NOTHING ELSE. 
    The text on which the test has to be based on is:
    {text}
    """

    testString = runModel(c)
    testLines = text.splitlines()
    test = {}
    for i in range(len(testLines)):
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

    #returneaza un dictionar de tip question : answer:valueOfTruth(True/False)
    return test
        
                


           
           
        
    

