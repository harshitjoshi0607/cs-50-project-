document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    chrome.storage.local.get(['currentUser', 'users'], (result) => {
        console.log('Current storage state:', result);
        
        if (!result.currentUser || !result.users || !result.users[result.currentUser]) {
            console.log('No user logged in, redirecting to login');
            window.location.href = 'login.html';
            return;
        }

        // Display user's citations
        const user = result.users[result.currentUser];
        const citationList = document.getElementById('citationList');
        
        if (user.citations && user.citations.length > 0) {
            user.citations.forEach((citation, index) => {
                const div = document.createElement('div');
                div.className = 'citation-item';
                
                const citationText = document.createElement('div');
                citationText.className = 'citation-text';
                citationText.textContent = citation;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => deleteCitation(index);
                
                div.appendChild(citationText);
                div.appendChild(deleteBtn);
                citationList.appendChild(div);
            });
        } else {
            citationList.innerHTML = '<p>No citations saved yet. Select text on any webpage and use "Copy & Cite" to add citations.</p>';
        }

        // Add event listeners for buttons
        // Add delete citation function
        window.deleteCitation = function(index) {
            chrome.storage.local.get(['currentUser', 'users'], (result) => {
                const users = result.users;
                const currentUser = result.currentUser;
                
                // Remove the citation at the specified index
                users[currentUser].citations.splice(index, 1);
                
                // Save updated citations
                chrome.storage.local.set({ users }, () => {
                    // Refresh the popup to show updated list
                    location.reload();
                });
            });
        };

        document.getElementById('exportBtn')?.addEventListener('click', () => {
            if (user.citations && user.citations.length > 0) {
                const text = user.citations.join('\n\n---\n\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = 'my_citations.txt';
                a.click();
                
                URL.revokeObjectURL(url);
            }
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            chrome.storage.local.remove('currentUser', () => {
                window.location.href = 'login.html';
            });
        });
    });
});