 if (localStorage.getItem('studia-theme') === 'dark') {
            document.body.classList.add('dark');
        }

        const libraryItems = document.getElementById('libraryItems');
        let savedItems = [];

        try {
            savedItems = JSON.parse(localStorage.getItem('studia-library') || '[]');
            if (!Array.isArray(savedItems)) savedItems = [];
        } catch {
            savedItems = [];
        }

        if (savedItems.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'library-empty';
            emptyMessage.textContent = 'Your library is empty. Create a summary or audiobook to see it here.';
            libraryItems.appendChild(emptyMessage);
        } else {
            for (const item of savedItems) {
                const card = document.createElement('article');
                card.className = 'library-card';

                const title = document.createElement('h2');
                title.textContent = item.type || 'Study material';

                const details = document.createElement('p');
                details.textContent = `${item.level || ''} detail · ${item.fileName || 'No file name'}`;

                const created = document.createElement('small');
                const date = new Date(item.createdAt);
                created.textContent = Number.isNaN(date.getTime()) ? '' : `Created ${date.toLocaleString()}`;

                card.append(title, details, created);
                libraryItems.appendChild(card);
            }
        }
