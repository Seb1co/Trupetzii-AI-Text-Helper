const API_BASE_URL = 'http://127.0.0.1:8000';
const libraryItems = document.getElementById('libraryItems');
const audioUrls = [];

function showLibraryMessage(text, className = 'library-empty') {
    const message = document.createElement('p');
    message.className = className;
    message.textContent = text;
    libraryItems.replaceChildren(message);
}

async function loadAudioPlayer(fileName, card, button) {
    const query = new URLSearchParams({ username: window.username, file_name: fileName });
    const response = await fetch(`${API_BASE_URL}/get_audio?${query}`);
    if (!response.ok) {
        throw new Error(`Request failed (${response.status}).`);
    }

    const result = await response.json();
    if (result.status !== 'success') {
        throw new Error(result.message || 'Could not load this audiobook.');
    }

    const audioBytes = Uint8Array.from(atob(result.data), character => character.charCodeAt(0));
    const audioUrl = URL.createObjectURL(new Blob([audioBytes], { type: 'audio/mpeg' }));
    audioUrls.push(audioUrl);

    const player = document.createElement('audio');
    player.className = 'library-audio';
    player.controls = true;
    player.preload = 'metadata';
    player.src = audioUrl;
    button.replaceWith(player);

    try {
        await player.play();
    } catch {
        player.focus();
    }
}

async function openTextFile(fileName, displayName) {
    const query = new URLSearchParams({ username: window.username, file_name: fileName });
    const response = await fetch(`${API_BASE_URL}/get_text?${query}`);
    if (!response.ok) {
        throw new Error(`Request failed (${response.status}).`);
    }

    const result = await response.json();
    if (result.status !== 'success') {
        throw new Error(result.message || 'Could not load this document.');
    }

    localStorage.setItem('studia-selected-summary', JSON.stringify({
        type: 'Summary',
        title: displayName,
        fileName: displayName,
        summaryText: result.data
    }));
    window.location.href = 'summary.html';
}

function createFileCard(fileName) {
    const extensionIndex = fileName.lastIndexOf('.');
    const extension = extensionIndex >= 0 ? fileName.slice(extensionIndex).toLowerCase() : '';
    const isAudio = extension === '.mp3';
    const isText = extension === '.txt';
    const baseName = extension ? fileName.slice(0, -extension.length) : fileName;
    const card = document.createElement('article');
    card.className = `library-card${isAudio ? ' is-audiobook' : ''}${isText ? ' is-summary' : ''}`;

    const heading = document.createElement('div');
    heading.className = 'library-card-heading';

    const icon = document.createElement('i');
    icon.className = `bx ${isAudio ? 'bx-headphone' : 'bx-file'} library-icon`;
    icon.setAttribute('aria-hidden', 'true');

    const title = document.createElement('h2');
    title.textContent = fileName;
    heading.append(icon, title);

    const details = document.createElement('p');
    details.textContent = isAudio ? 'Audiobook · MP3' : isText ? 'Document · TXT' : 'File';
    card.append(heading, details);

    if (isAudio) {
        const listenButton = document.createElement('button');
        listenButton.className = 'library-listen';
        listenButton.type = 'button';
        listenButton.setAttribute('aria-label', `Listen to ${fileName}`);

        const playIcon = document.createElement('i');
        playIcon.className = 'bx bx-play';
        playIcon.setAttribute('aria-hidden', 'true');
        listenButton.append(playIcon, document.createTextNode('Listen'));
        listenButton.addEventListener('click', async () => {
            listenButton.disabled = true;
            listenButton.textContent = 'Loading audio...';
            try {
                await loadAudioPlayer(baseName, card, listenButton);
            } catch (error) {
                console.error('Could not open library file:', error);
                const errorMessage = document.createElement('p');
                errorMessage.className = 'library-error';
                errorMessage.textContent = error.message || 'Could not open this file.';
                card.append(errorMessage);
                listenButton.disabled = false;
                listenButton.textContent = 'Try again';
            }
        });
        card.appendChild(listenButton);
    } else if (isText) {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Open document ${fileName}`);

        const openFile = () => openTextFile(baseName, fileName).catch(error => {
            console.error('Could not open library file:', error);
            const errorMessage = document.createElement('p');
            errorMessage.className = 'library-error';
            errorMessage.textContent = error.message || 'Could not open this file.';
            card.append(errorMessage);
        });

        card.addEventListener('click', openFile);
        card.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openFile();
            }
        });
    }

    return card;
}

async function loadLibrary() {
    if (localStorage.getItem('studia-theme') === 'dark') {
        document.body.classList.add('dark');
    }

    if (!window.username) {
        showLibraryMessage('Please log in to view your files.');
        return;
    }

    try {
        const query = new URLSearchParams({ username: window.username });
        const response = await fetch(`${API_BASE_URL}/get_files?${query}`);
        if (!response.ok) {
            throw new Error(`Request failed (${response.status}).`);
        }

        const result = await response.json();
        if (result.status !== 'success' || !Array.isArray(result.data)) {
            throw new Error(result.message || 'Could not load your files.');
        }

        libraryItems.replaceChildren();
        if (result.data.length === 0) {
            showLibraryMessage('Your library is empty. Create a summary or audiobook to see it here.');
            return;
        }

        result.data.forEach(fileName => {
            if (typeof fileName === 'string') {
                libraryItems.appendChild(createFileCard(fileName));
            }
        });
    } catch (error) {
        console.error('Could not load library:', error);
        showLibraryMessage('Could not load your files. Make sure the backend is running.', 'library-error');
    }
}

window.addEventListener('pagehide', () => {
    audioUrls.forEach(audioUrl => URL.revokeObjectURL(audioUrl));
});

loadLibrary();
