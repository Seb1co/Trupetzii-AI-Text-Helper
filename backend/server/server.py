from pathlib import Path
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import base64
from text_converter.textRecog import imgRec
from audio_converter.text_speech import voice_converter
from database import DataBase
from text_converter.geminiAgent import correctText,summarizeText

BASE_DIR = Path(__file__).resolve().parent
FILES_DIR = BASE_DIR / "Files"


def _validate_path_part(value: str, label: str) -> str:
    if not value or value in {".", ".."} or "/" in value or "\\" in value:
        raise HTTPException(status_code=400, detail=f"Invalid {label}.")
    return value


def _user_directory(username: str, create: bool = False) -> Path:
    username = _validate_path_part(username, "username")
    directory = FILES_DIR / username
    if create:
        directory.mkdir(parents=True, exist_ok=True)
    return directory


def _material_path(username: str, file_name: str, extension: str, create_user: bool = False) -> Path:
    file_name = _validate_path_part(file_name, "file name")
    return _user_directory(username, create=create_user) / f"{file_name}{extension}"


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginMessage(BaseModel):
    username : str
    password : str

class PhotoDetails(BaseModel):
    file_name  : str
    image_bytes: str

class GeneratePhotosMessage(BaseModel):
    username : str
    file_name: str
    photos   : List[PhotoDetails]

@app.post('/sign_in')
async def sign_in(date : LoginMessage):
    _validate_path_part(date.username, "username")
    db = DataBase()
    db.connect()
    if db.sign_in(date.username,date.password):
        db.disconnect()
        _user_directory(date.username, create=True)
        return{
            "status": "success",
            "message": f"The user {date.username} has signed in"
        }
    db.disconnect()
    return{
        "status": "failed",
        "message": f"The user {date.username} already has an account"
    }
@app.post('/log_in')
async def log_in(date : LoginMessage):
    db = DataBase()
    db.connect()
    if db.login(date.username,date.password):
        db.disconnect()
        return {
            "status": "success",
            "message": f"The user {date.username} has logged in"
        }
    db.disconnect()
    return {
        "status": "failed",
        "message": "Invalid username or password"
    }

@app.post('/generate_text')
async def generate_text(date : GeneratePhotosMessage):
    text_path = _material_path(date.username, date.file_name, ".txt", create_user=True)
    if not text_path.exists():
        texts = ""
        for image in date.photos:
            image_data = base64.b64decode(image.image_bytes)
            texts += summarizeText(correctText(imgRec(image_data)))
        with text_path.open('w', encoding='utf-8') as writer:
            writer.write(texts)
            db = DataBase()
            db.connect()
            db.add_file(date.username, text_path.name)
            db.disconnect()
            return{
                "status" : "success",
                "message": f"The file {date.file_name}.txt was successfuly saved"
            }
    return {
        "status": "failed",
        "message": f"The file {date.file_name}.txt already exists"
    }

@app.post('/generate_audio')
async def generate_audio(date: GeneratePhotosMessage):
    audio_path = _material_path(date.username, date.file_name, ".mp3", create_user=True)
    text_path = _material_path(date.username, date.file_name, ".txt")
    if not audio_path.exists():
        if not text_path.exists():
            texts = ""
            for image in date.photos:
                image_data = base64.b64decode(image.image_bytes)
                texts += summarizeText(correctText(imgRec(image_data)))
            with audio_path.open('wb') as writer:
                writer.write(await voice_converter(texts))
        else:
            with text_path.open('r', encoding='utf-8') as reader:
                file_text = reader.read()
            with audio_path.open('wb') as writer:
                writer.write(await voice_converter(file_text))
        return{
            "status" : "success",
            "message": f"The file {date.file_name}.mp3 was successfully saved"
        }
    return {
        "status": "failed",
        "message": f"The file {date.file_name}.mp3 already exists"
    }

@app.get('/get_files')
async def get_files (username : str):
    user_directory = _user_directory(username)
    files = sorted(
        (path.name for path in user_directory.iterdir() if path.is_file()),
        key=str.casefold
    ) if user_directory.is_dir() else []
    return {
        "status": "success",
        "data": files
    }
@app.get('/get_text')
async def get_text(username : str,file_name : str):
        text_path = _material_path(username, file_name, ".txt")
        if text_path.exists():
            with text_path.open('r', encoding='utf-8') as reader:
                return{
                    "status": "success",
                    "data": reader.read()
                }
        else:
            return {
                "status": "failed"
            }

@app.get('/get_audio')
async def get_audio(username : str,file_name : str):
    audio_path = _material_path(username, file_name, ".mp3")
    if audio_path.exists():
        with audio_path.open('rb') as reader:
            return{
                "status": "success",
                "data": base64.b64encode(reader.read()).decode('utf-8')
            }
    else:
        return{
            "status": "failed"
        }

def main():
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    main()
