// app.js
const socket = io();
const groupList = document.getElementById('group-list');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');

function sendMessage() {
    const message = messageInput.value;
    if (message) {
        socket.emit('message', message);
        messageInput.value = '';
    }
}

socket.on('message', (message) => {
    const li = document.createElement('li');
    li.textContent = message;
    messages.appendChild(li);
});

socket.on('updateGroups', (groups) => {
    groupList.innerHTML = '';
    groups.forEach((group) => {
        const li = document.createElement('li');
        li.textContent = group;
        li.onclick = () => joinGroup(group);
        groupList.appendChild(li);
    });
});

function joinGroup(group) {
    socket.emit('joinGroup', group);
}
