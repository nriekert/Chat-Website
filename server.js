const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Store active sockets and groups
const activeSockets = {};
const groups = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle username and group selection
  socket.on('join', ({ username, group }) => {
    socket.username = username;
    socket.group = group;

    // Store the socket in the activeSockets object
    if (!activeSockets[group]) {
      activeSockets[group] = [];
    }
    activeSockets[group].push(socket);

    // Join the room corresponding to the selected group
    socket.join(group);

    // Notify everyone in the group about the new user
    io.to(group).emit('message', {
      username: 'System',
      text: `${username} has joined the chat`,
    });

    // Update the list of users for all clients in the group
    updateUsersInGroup(group);
  });

  // Handle chat messages
  socket.on('message', (message) => {
    io.to(socket.group).emit('message', {
      username: socket.username,
      text: message,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove the socket from the activeSockets object
    const index = activeSockets[socket.group].indexOf(socket);
    if (index !== -1) {
      activeSockets[socket.group].splice(index, 1);
    }

    // Notify everyone in the group about the user leaving
    io.to(socket.group).emit('message', {
      username: 'System',
      text: `${socket.username} has left the chat`,
    });

    // Update the list of users for all clients in the group
    updateUsersInGroup(socket.group);
  });
});

// Function to update the list of users in a group
function updateUsersInGroup(group) {
  const users = activeSockets[group].map((socket) => socket.username);
  io.to(group).emit('updateUsers', users);
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
