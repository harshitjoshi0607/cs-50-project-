// Handle form visibility
const showForm = (formId) => {
    ['loginForm', 'registerForm', 'resetForm'].forEach(id => {
        document.getElementById(id).style.display = id === formId ? 'block' : 'none';
    });
};

// Form switching event listeners
document.getElementById('createAccountLink').addEventListener('click', () => showForm('registerForm'));
document.getElementById('resetPasswordLink').addEventListener('click', () => showForm('resetForm'));
document.getElementById('backToLoginLink').addEventListener('click', () => showForm('loginForm'));
document.getElementById('backToLoginFromResetLink').addEventListener('click', () => showForm('loginForm'));

// Login handler
document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    chrome.storage.local.get(['users'], (result) => {
        const users = result.users || {};
        if (users[username] && users[username].password === password) {
            chrome.storage.local.set({ currentUser: username }, () => {
                window.location.href = 'popup.html';
            });
        } else {
            document.getElementById('loginError').textContent = 'Invalid username or password';
        }
    });
});

// Register handler
document.getElementById('registerBtn').addEventListener('click', () => {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    
    if (password !== confirmPassword) {
        document.getElementById('registerError').textContent = 'Passwords do not match';
        return;
    }
    
    chrome.storage.local.get(['users'], (result) => {
        const users = result.users || {};
        if (users[username]) {
            document.getElementById('registerError').textContent = 'Username already exists';
            return;
        }
        
        users[username] = {
            password: password,
            email: email,
            citations: []
        };
        
        chrome.storage.local.set({ users }, () => {
            showForm('loginForm');
            document.getElementById('loginError').textContent = 'Registration successful! Please login.';
            document.getElementById('loginError').style.color = 'green';
        });
    });
});

// Reset password handler
document.getElementById('resetBtn').addEventListener('click', () => {
    const email = document.getElementById('resetEmail').value;
    
    chrome.storage.local.get(['users'], (result) => {
        const users = result.users || {};
        let userFound = false;
        
        Object.keys(users).forEach(username => {
            if (users[username].email === email) {
                userFound = true;
                // Generate temporary password
                const tempPassword = Math.random().toString(36).slice(-8);
                users[username].password = tempPassword;
                
                chrome.storage.local.set({ users }, () => {
                    document.getElementById('resetError').textContent = 
                        `Temporary password: ${tempPassword}\nPlease login and change it.`;
                    document.getElementById('resetError').style.color = 'green';
                });
            }
        });
        
        if (!userFound) {
            document.getElementById('resetError').textContent = 'Email not found';
        }
    });
});