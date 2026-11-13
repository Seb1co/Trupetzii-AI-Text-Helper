const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const createType = document.getElementById('createType');
const message = document.getElementById('message');
const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.querySelector('.sidebar .toggle');

let selectedType = 'Audiobook';
let selectedLevel = 'Balanced';

if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
        const isCollapsed = sidebar.classList.toggle('close');
        sidebarToggle.setAttribute('aria-expanded', String(!isCollapsed));
        sidebarToggle.setAttribute('aria-label', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
    });
}

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
    const chosenFile = fileInput && fileInput.files && fileInput.files[0];
    const fileLabel = chosenFile ? chosenFile.name : 'your selected file';
    const summaryText = `Creating ${selectedType.toLowerCase()} with ${selectedLevel.toLowerCase()} detail for ${fileLabel}.`;

    if (message) {
        message.textContent = summaryText;
    }
}

if (fileInput && fileName) {
    fileInput.addEventListener('change', function () {
        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
        }
    });
}

