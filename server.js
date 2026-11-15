

import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

const BASE_URL = 'http://localhost:8000';

// Funcție ajutătoare pentru a citi fișierele locale și a le transforma în Base64
async function preparePhotos(filePaths) {
    const photos = [];
    for (const filePath of filePaths) {
        const buffer = await readFile(filePath);
        photos.push({
            file_name: basename(filePath),
            image_bytes: buffer.toString('base64')
        });
    }
    return photos;
}

// 1. Înregistrare (Sign In)
async function signUp(username, password) {
    try {
        const response = await fetch(`${BASE_URL}/sign_in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log("Rezultat Sign In:", data);
        return data;
    } catch (error) {
        console.error("Eroare la sign_in:", error);
    }
}

// 2. Autentificare (Log In)
async function logIn(username, password) {
    try {
        const response = await fetch(`${BASE_URL}/log_in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log("Rezultat Log In:", data);
        return data;
    } catch (error) {
        console.error("Eroare la log_in:", error);
    }
}

// 3. Generare Text din Poze
async function generateText(username, fileName, filePaths) {
    try {
        const photos = await preparePhotos(filePaths);
        const payload = {
            username: username,
            file_name: fileName,
            photos: photos
        };

        const response = await fetch(`${BASE_URL}/generate_text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log("Rezultat Generate Text:", data);
        return data;
    } catch (error) {
        console.error("Eroare la generate_text:", error);
    }
}

// 4. Generare Audio
async function generateAudio(username, fileName, filePaths = []) {
    try {
        const photos = await preparePhotos(filePaths);
        const payload = {
            username: username,
            file_name: fileName,
            photos: photos
        };

        const response = await fetch(`${BASE_URL}/generate_audio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if(data.status === 'success') {
            console.log("Fișierul audio a fost generat cu succes.");
        }
    } catch (error) {
        console.error("Eroare la generate_audio:", error);
    }
}

// 5. Preluare listă de fișiere pentru un utilizator (GET)
async function getFiles(username) {
    try {
        const response = await fetch(`${BASE_URL}/get_files?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        console.log("Lista de fișiere:", data);
        if (data.status === 'success') {
            return data.data; // Returnează lista de fișiere;
        } else {
            console.log("Nu s-au putut prelua fișierele");
        }
    } catch (error) {
        console.error("Eroare la get_files:", error);
    }
}

// 6. Preluare conținut text (GET)
async function getText(username, fileName) {
    try {
        const response = await fetch(`${BASE_URL}/get_text?username=${encodeURIComponent(username)}&file_name=${encodeURIComponent(fileName)}`);
        const data = await response.json();
        console.log("Conținut text extras:", data);
        if (data.status === 'success') {
            return data.data; // Returnează conținutul text;
        }
        console.log("Nu s-a putut prelua conținutul text");
    } catch (error) {
        console.error("Eroare la get_text:", error);
    }
}

// 7. Preluare fișier audio (GET) și salvare pe disc
async function getAudio(username, fileName, outputFilePath = 'output.mp3') {
    try {
        const response = await fetch(`${BASE_URL}/get_audio?username=${encodeURIComponent(username)}&file_name=${encodeURIComponent(fileName)}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            // Deoarece serverul trimite audio-ul sub formă de Base64
            const audioBuffer = Buffer.from(data.data, 'base64');
            await writeFile(outputFilePath, audioBuffer);
            console.log(`Fișierul audio a fost descărcat și salvat cu succes ca: ${outputFilePath}`);
        } else {
            console.log("Nu s-a putut prelua fișierul audio:", data);
        }
    } catch (error) {
        console.error("Eroare la get_audio:", error);
    }
}

// --- EXEMPLU DE UTILIZARE ---


module.exports = {
    signUp,
    logIn,
    generateText,
    generateAudio,
    getFiles,
    getText,
    getAudio
}

// ruleazaFluxul();