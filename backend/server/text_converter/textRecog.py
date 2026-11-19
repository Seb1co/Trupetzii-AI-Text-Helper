import pandas as pd
import numpy as np
import io
from PIL import Image
from paddleocr import PaddleOCR
import cv2


# linii de sters:

def imgRec(bytes):
    # inlocuieste cu imaginea primita de user
    receivedImg = Image.open(io.BytesIO(bytes)).convert('RGB')

    # inlocuieste cu limba textului
    language = 'Romanian'

    lanDict = {
        "English": "en",
        "Spanish": "es",
        "Italian": "it",
        "Romanian": "ro",
        "Chinese": "ch",
        "Japanese": "japan",
        "Portuguese": "pt",
        "Hindi": "hi",
        "German": "de",
        "French": "fr",
    }

    pixels = np.array(receivedImg, dtype=np.uint8)

    # preprocessing
    pixels = cv2.cvtColor(pixels, cv2.COLOR_BGR2GRAY)


    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    pixels = clahe.apply(pixels)

    pixels = cv2.bilateralFilter(pixels, 9, 75, 75)

    pixels = cv2.cvtColor(pixels, cv2.COLOR_GRAY2RGB)

    # the bigger dimension will always be 960
    width, height = receivedImg.size
    padVal = 0.1

    def borCalc(width, height):
        maxBor = max(width, height)
        minBor = min(width, height)
        r = maxBor / minBor
        maxBor = maxBor * padVal * r
        minBor = minBor * padVal
        return (int(maxBor), int(minBor))

    if width > height:
        x, y = borCalc(width, height)
    else:
        y, x = borCalc(width, height)
    pixels = cv2.copyMakeBorder(pixels, y, y, x, x, cv2.BORDER_CONSTANT, value=[255, 255, 255])

    igmodel = PaddleOCR(use_textline_orientation=True,
                        lang=lanDict[language],
                        enable_mkldnn=False,
                        text_det_unclip_ratio=1.8,
                        text_det_box_thresh=0.4,
                        text_det_limit_type='min')

    y = igmodel.predict(pixels)

    recogText = " "
    recogText = recogText.join(y[0]['rec_texts'])
    return recogText