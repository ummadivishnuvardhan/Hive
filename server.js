const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Hello World 🚀');
});

app.get('/profile', (req, res) => {
    res.send('This is the profile page.');
});

app.get('/about', (req, res) => {
    res.send('This is the about page.');
});

app.get('/contact', (req, res) => {
    res.send('This is the contact page.');
});

const PORT = 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});