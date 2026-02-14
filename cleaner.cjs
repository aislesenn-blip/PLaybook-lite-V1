const fs = require('fs');
const path = require('path');

// Folder la kuanzia
const rootDir = 'public/assets/audio';

function cleanDirectory(directory) {
    if (!fs.existsSync(directory)) {
        console.log(`Folder not found: ${directory}`);
        return;
    }

    const items = fs.readdirSync(directory);

    items.forEach(item => {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Kama ni folder, ingia ndani (recursive)
            cleanDirectory(fullPath);
        } else {
            // Kama ni faili, angalia extension mbovu
            let newName = null;

            if (item.endsWith('.mp3.mp3')) {
                newName = item.replace('.mp3.mp3', '.mp3');
            } else if (item.endsWith('.mp3.mpeg')) {
                newName = item.replace('.mp3.mpeg', '.mp3');
            } else if (item.endsWith('.mpeg')) {
                newName = item.replace('.mpeg', '.mp3');
            }

            if (newName) {
                const newPath = path.join(directory, newName);
                fs.renameSync(fullPath, newPath);
                console.log(`✅ FIXED: ${item} -> ${newName}`);
            }
        }
    });
}

console.log('🚀 Starting Cleanup...');
cleanDirectory(rootDir);
console.log('✨ Cleanup Complete!');