const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const materialName = document.getElementById('materialName');
const createType = document.getElementById('createType');
const message = document.getElementById('message');
const uploadArea = document.querySelector('.upload-area');


let selectedType = 'Audiobook';
let selectedLevel = 'Shorter';
let selectedFile = null;

function selectType(type, button) {
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

function selectLevel(level, button) {
    selectedLevel = level;
    document.querySelectorAll('.levels button').forEach((levelButton) => {
        levelButton.classList.remove('level-selected');
    });

    if (button) {
        button.classList.add('level-selected');
    }
}

function createMaterial() {
    const chosenFile = selectedFile || (fileInput && fileInput.files && fileInput.files[0]);
    const fileLabel = chosenFile ? chosenFile.name : 'your selected file';
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

    const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: selectedType,
        title: enteredTitle,
        level: selectedLevel,
        fileName: fileLabel,
        createdAt: new Date().toISOString()
    };

    const library = JSON.parse(localStorage.getItem('studia-library') || '[]');
    library.unshift(item);
    localStorage.setItem('studia-library', JSON.stringify(library));

    if (message) {
        message.textContent =
            `Created ${selectedType.toLowerCase()} with ${selectedLevel.toLowerCase()} detail for ${fileLabel}.`;
    }
}

function handleFile(file) {
    if (!file || !fileInput || !fileName) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        fileInput.value = '';
        selectedFile = null;
        fileName.textContent = 'Image files only - PNG, JPG, WEBP';
        if (message) {
            message.textContent = 'Please choose an image file.';
        }
        return;
    }

    selectedFile = file;
    fileName.textContent = file.name;
    if (message) {
        message.textContent = '';
    }
}

if (fileInput) {
    fileInput.addEventListener('change', function () {
        handleFile(this.files && this.files[0]);
    });
}

if (uploadArea) {
    uploadArea.addEventListener('dragover', function (event) {
        event.preventDefault();
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
        const droppedFile = event.dataTransfer.files[0];

        if (!droppedFile || !fileInput) {
            return;
        }

        handleFile(droppedFile);
    });
}


