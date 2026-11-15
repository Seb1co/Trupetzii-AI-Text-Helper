const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const materialName = document.getElementById('materialName');
const createType = document.getElementById('createType');
const message = document.getElementById('message');
const uploadArea = document.querySelector('.upload-area');
const createButton = document.querySelector('.create-button');
const createSpinner = document.getElementById('createSpinner');


let selectedType = 'Audiobook';
let selectedFiles = [];
let isProcessing = false;
const API_BASE_URL = 'http://127.0.0.1:8000';

function setProcessing(processing) {
    isProcessing = processing;

    if (fileInput) {
        fileInput.disabled = processing;
    }
    if (materialName) {
        materialName.disabled = processing;
    }
    if (createButton) {
        createButton.disabled = processing;
        createButton.setAttribute('aria-busy', String(processing));
    }
    if (createSpinner) {
        createSpinner.hidden = !processing;
    }

    document.querySelectorAll('.choice-buttons button').forEach((button) => {
        button.disabled = processing;
    });

    if (uploadArea) {
        uploadArea.classList.toggle('is-processing', processing);
        uploadArea.setAttribute('aria-busy', String(processing));
    }
    const createContent = document.querySelector('.create-content');
    if (createContent) {
        createContent.setAttribute('aria-busy', String(processing));
    }
}

async function preparePhotos(files) {
    return Promise.all(Array.from(files || []).map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result);
            resolve({
                file_name: file.name,
                image_bytes: dataUrl.slice(dataUrl.indexOf(',') + 1)
            });
        };
        reader.onerror = () => reject(reader.error || new Error(`Could not read ${file.name}.`));
        reader.readAsDataURL(file);
    })));
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) {
        throw new Error(`API request failed (${response.status}).`);
    }
    return response.json();
}

async function signUp(username, password) {
    return apiRequest('/sign_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
}

async function logIn(username, password) {
    return apiRequest('/log_in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
}

async function generateText(username, name, files = selectedFiles) {
    const photos = await preparePhotos(files);
    return apiRequest('/generate_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, file_name: name, photos })
    });
}

async function generateAudio(username, name, files = selectedFiles) {
    const photos = await preparePhotos(files);
    return apiRequest('/generate_audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, file_name: name, photos })
    });
}

async function getFiles(username = window.username) {
    const query = new URLSearchParams({ username });
    const result = await apiRequest(`/get_files?${query}`);
    return result.status === 'success' ? result.data : undefined;
}

async function getText(username, name) {
    const query = new URLSearchParams({ username, file_name: name });
    const result = await apiRequest(`/get_text?${query}`);
    return result.status === 'success' ? result.data : undefined;
}

async function getAudio(username, name) {
    const query = new URLSearchParams({ username, file_name: name });
    const result = await apiRequest(`/get_audio?${query}`);
    if (result.status !== 'success') {
        return result;
    }

    const audioBytes = Uint8Array.from(atob(result.data), (character) => character.charCodeAt(0));
    const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = audioUrl;
    downloadLink.download = `${name}.mp3`;
    downloadLink.click();
    window.setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
    return result;
}

function selectType(type, button) {
    if (isProcessing) return;
    selectedType = type;
    document.querySelectorAll('.choice-buttons button').forEach((choiceButton) => {
        choiceButton.classList.remove('choice-selected');
        choiceButton.classList.add('choice');
    });

    if (button) {
        button.classList.remove('choice');
        button.classList.add('choice-selected');
    }

    if (createType) {
        createType.textContent = type.toLowerCase();
    }
}

async function createMaterial() {
    if (isProcessing) return;

    const fileNames = selectedFiles.map((file) => file.name);
    const fileLabel = fileNames.length ? fileNames.join(', ') : 'your selected file';
    const enteredTitle = materialName ? materialName.value.trim() : '';

    if (!enteredTitle) {
        if (message) {
            message.textContent = 'Please enter a name for your material.';
        }
        if (materialName) {
            materialName.focus();
        }
        return;
    }

    if (!window.username) {
        if (message) {
            message.textContent = 'Please log in before creating material.';
        }
        return;
    }

    if (!selectedFiles.length) {
        if (message) {
            message.textContent = 'Please choose at least one image.';
        }
        return;
    }

    setProcessing(true);
    if (message) {
        message.textContent = 'Processing images and creating your material...';
    }

    try {
        const result = selectedType === 'Audiobook'
            ? await generateAudio(window.username, enteredTitle)
            : await generateText(window.username, enteredTitle);

        if (result.status !== 'success') {
            if (message) {
                message.textContent = result.message || 'The material could not be created.';
            }
            return;
        }

        let summaryText = '';
        if (selectedType === 'Summary') {
            summaryText = await getText(window.username, enteredTitle) || '';
        }

        const item = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            type: selectedType,
            title: enteredTitle,
            fileName: fileLabel,
            fileNames,
            summaryText,
            createdAt: new Date().toISOString()
        };

        const library = JSON.parse(localStorage.getItem('studia-library') || '[]');
        library.unshift(item);
        localStorage.setItem('studia-library', JSON.stringify(library));

        if (message) {
            message.textContent = result.message ||
                `Created ${selectedType.toLowerCase()} for ${fileLabel}.`;
        }
    } catch (error) {
        console.error('Could not create material:', error);
        if (message) {
            message.textContent = 'Could not connect to the server. Make sure the backend is running.';
        }
    } finally {
        setProcessing(false);
    }
}

function handleFiles(files) {
    if (isProcessing) return;
    const incomingFiles = Array.from(files || []);
    const imageFiles = incomingFiles.filter((file) => file.type.startsWith('image/'));
    const rejectedCount = incomingFiles.length - imageFiles.length;

    selectedFiles.push(...imageFiles);

    if (fileName) {
        fileName.textContent = selectedFiles.length
            ? selectedFiles.map((file) => file.name).join('\n')
            : 'Image files only - PNG, JPG, WEBP';
    }

    if (message) {
        message.textContent = rejectedCount
            ? 'Only image files are accepted. Valid images have been added.'
            : '';
    }
}

if (fileInput) {
    fileInput.addEventListener('change', function () {
        if (isProcessing) return;
        handleFiles(this.files);
        // Allow the same image to be selected again later if needed.
        this.value = '';
    });
}

if (uploadArea) {
    uploadArea.addEventListener('dragover', function (event) {
        event.preventDefault();
        if (isProcessing) return;
        uploadArea.classList.add('is-dragging');
    });

    uploadArea.addEventListener('dragleave', function (event) {
        if (!uploadArea.contains(event.relatedTarget)) {
            uploadArea.classList.remove('is-dragging');
        }
    });

    uploadArea.addEventListener('drop', function (event) {
        event.preventDefault();
        uploadArea.classList.remove('is-dragging');
        if (isProcessing) return;
        if (!event.dataTransfer.files.length || !fileInput) {
            return;
        }

        handleFiles(event.dataTransfer.files);
    });
}


