const peer = new Peer();
const myVideo = document.getElementById('my-video');
const peersContainer = document.getElementById('peers-container');
const participantsList = document.getElementById('participants');
const peerIdElement = document.getElementById('peer-id');
const copyIdButton = document.getElementById('copy-id');
const themeToggle = document.getElementById('theme-toggle');
let myStream;
let connections = {};
let isAdmin = true;

// Dark Mode Toggle
themeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
};

// Copy Peer ID
copyIdButton.onclick = () => {
    navigator.clipboard.writeText(peerIdElement.textContent).then(() => {
        showNotification('Peer ID copied to clipboard');
    });
};

// Notifications
function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerText = message;
    document.getElementById('notifications').append(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Initialize Peer Connection
peer.on('open', (id) => {
    peerIdElement.textContent = id;
    showNotification('Your room is ready. Share the ID to invite others.');
});

// Start Video Stream
document.getElementById('start-call').onclick = async () => {
    myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    myVideo.srcObject = myStream;
    showNotification('Video stream started');
};

// Chat Functionality
const chatArea = document.getElementById('chat');
document.getElementById('send-message').onclick = () => {
    const message = chatArea.value;
    if (message) {
        Object.keys(connections).forEach(peerId => {
            // Send message to each peer
            showNotification(`Message sent to ${peerId}: ${message}`);
        });
        chatArea.value = "";  // Clear chat
    }
};

// Admin Controls: Mute and Remove
function addParticipant(peerId, role) {
    const listItem = document.createElement('li');
    listItem.innerText = `${role} - ${peerId}`;
    if (isAdmin && role === 'User') {
        const muteButton = document.createElement('button');
        muteButton.textContent = "Mute";
        muteButton.onclick = () => toggleUserAudio(peerId, false);
        const removeButton = document.createElement('button');
        removeButton.textContent = "Remove";
        removeButton.onclick = () => removeUser(peerId);
        listItem.append(muteButton, removeButton);
    }
    participantsList.append(listItem);
}

function toggleUserAudio(peerId, mute) {
    // Logic to mute the audio of peer with `peerId`
    showNotification(`Toggling audio for ${peerId} - mute: ${mute}`);
}

function removeUser(peerId) {
    if (connections[peerId]) {
        connections[peerId].remove();
        delete connections[peerId];
        showNotification(`User ${peerId} removed`);
    }
}
