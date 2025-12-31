require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Essential for browser connection
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors()); // Allows your HTML file to talk to this server
app.use(express.json());

const SECRET_KEY = "super_secret_key";
const users = []; // Temporary storage (clears on restart)

// Middleware to verify the Token
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = decoded;
        next();
    });
};

// --- API ENDPOINTS ---

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword, balance: 1000 };
    users.push(newUser);
    res.status(201).json({ message: "Account Created!", id: newUser.id });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        return res.json({ token });
    }
    res.status(401).json({ error: "Invalid Login" });
});

// NEW: Get current user balance
app.get('/balance', authenticate, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    res.json({ balance: user.balance });
});

app.post('/transfer', authenticate, (req, res) => {
    const { amount, recipientId } = req.body;
    const sender = users.find(u => u.id === req.user.id);
    const recipient = users.find(u => u.id === parseInt(recipientId));

    if (!recipient) return res.status(404).json({ error: "Recipient not found" });
    if (sender.balance < amount) return res.status(400).json({ error: "Insufficient funds" });

    sender.balance -= amount;
    recipient.balance += amount;
    res.json({ message: "Transfer Successful", newBalance: sender.balance });
});

app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));