const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = [];
let onlineUsers = [];

app.use(express.static('public')); // Serve static files from "public" folder

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected');
    onlineUsers.push(socket.id);
    io.emit('updateUsers', onlineUsers.map(id => id));

    // Send chat history when a user connects
    socket.emit('history', messages);

    // Listen for new messages
    socket.on('sendMessage', (message) => {
        const newMessage = { 
            id: new Date().toISOString(), 
            user: 'You', 
            text: message.text, 
            timestamp: new Date().toLocaleString()
        };
        messages.push(newMessage);
        io.emit('message', newMessage);
    });

    // Listen for message deletion
    socket.on('deleteMessage', (messageId) => {
        messages = messages.filter(msg => msg.id !== messageId);
        io.emit('message', { id: messageId, deleted: true });
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        onlineUsers = onlineUsers.filter(id => id !== socket.id);
        io.emit('updateUsers', onlineUsers.map(id => id));
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
