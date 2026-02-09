const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

const DATA_FILE = './users_data.json';

// Load or initialize user data
async function loadUserData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist, return default admin account
        return {
            'Abhinav': { 
                password: 'Abhi143$', 
                isAdmin: true,
                clickers: [],
                totalScore: 0
            }
        };
    }
}

// Save user data
async function saveUserData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await loadUserData();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'failed to load users' });
    }
});

// Save user data
app.post('/api/users', async (req, res) => {
    try {
        const users = req.body;
        await saveUserData(users);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'failed to save users' });
    }
});

// Auto-login endpoint
app.get('/api/auto-login', async (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.json({ success: false });
    }
    
    try {
        const users = await loadUserData();
        if (users[username]) {
            res.json({ 
                success: true, 
                user: {
                    username: username,
                    isAdmin: users[username].isAdmin || false,
                    clickers: users[username].clickers || [],
                    totalScore: users[username].totalScore || 0
                }
            });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        res.status(500).json({ error: 'failed to auto-login' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
