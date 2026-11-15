import hmac
import sqlite3
import encryption
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "studia.db"
FILES_DIR = BASE_DIR / "Files"

class DataBase :
    def __init__(self):
        self.connection = None


    def connect(self):
        if not self.connection:
            self.connection = sqlite3.connect(DATABASE_PATH)

    def disconnect(self):
        if self.connection:
            self.connection.close()

    def add_file(self,username : str,file_name : str):
        if not self.connection:
            self.connect()
        file_path = FILES_DIR / username / file_name
        if not file_path.is_file():
            raise FileNotFoundError(file_path)
        cursor = self.connection.cursor()
        cursor.execute(
            "UPDATE users SET files = COALESCE(files, '') || ? WHERE username = ?",
            (file_name, username)
        )
        self.connection.commit()

    def login(self,username : str,password : str) -> bool:
        cursor = self.connection.cursor()
        cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        if row is None:
            cursor.execute(
                "INSERT INTO users (username, password, files) VALUES (?, ?, ?)",
                (username, encryption.encrypt(password), "")
            )
            self.connection.commit()
            return True

        stored_password = row[0]
        return isinstance(stored_password, str) and hmac.compare_digest(
            stored_password,
            encryption.encrypt(password)
        )

    def sign_in(self,username : str , password : str) -> bool:
        cursor = self.connection.cursor()
        cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            return False

        cursor.execute(
            "INSERT INTO users (username, password, files) VALUES (?, ?, ?)",
            (username, encryption.encrypt(password), "")
        )
        self.connection.commit()
        return True

    def get_user_files(self,username : str) -> str:
        command = f"SELECT files FROM users WHERE username = \"{username}\""
        cursor = self.connection.cursor()
        result = cursor.execute(command)
        return result

    def show_database(self):
        command = "SELECT * FROM users"
        cursor = self.connection.cursor()
        result = cursor.execute(command)
        self.connection.commit()
        print(result)
def main():
    connection = sqlite3.connect(DATABASE_PATH)
    command = ("CREATE TABLE users("
               "username TEXT,"
               "password TEXT,"
               "files TEXT"
               ")")
    cursor = connection.cursor()
    cursor.execute(command)
    connection.commit()