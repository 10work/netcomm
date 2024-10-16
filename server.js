const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle socket connections
io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('signal', (data) => {
        io.to(data.target).emit('signal', {
            sender: socket.id,
            signal: data.signal,
        });
    });

    socket.on('sendMessage', (msg) => {
        io.emit('receiveMessage', msg);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

