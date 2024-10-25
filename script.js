const peer = new Peer();
const myVideo = document.getElementById('my-video');
const peersContainer = document.getElementById('peers-container');
const participantsList = document.getElementById('participants');
const peerIdElement = document.getElementById('peer-id');
const copyIdButton = document.getElementById('copy-id');
const themeToggle = document.getElementById('theme-toggle');
let myStream;
let connections = {};
let isAdmin = true;  // Set as `true` for the room creator

// Toggle Dark Mode
themeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
};

// Copy Peer ID
copyIdButton.onclick = () => {
    navigator.clipboard.writeText(peerIdElement.textContent).then(() => {
        alert('Peer ID copied to clipboard');
    });
};

// Display Peer ID and Initialize
peer.on('open', (id) => {
    peerIdElement.textContent = id;
});

// Start Video Stream
document.getElementById('start-call').onclick = async () => {
    myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    myVideo.srcObject = myStream;
};

// Mute/Unmute Audio and Video
document.getElementById('mute-audio').onclick = () => toggleTrack('audio');
document.getElementById('mute-video').onclick = () => toggleTrack('video');

function toggleTrack(type) {
    myStream.getTracks().forEach(track => {
        if (track.kind === type) track.enabled = !track.enabled;
    });
}

// Connect to Room or Peer
document.getElementById('connect').onclick = () => {
    const roomId = document.getElementById('room-id-input').value;
    if (roomId) {
        const call = peer.call(roomId, myStream);
        call.on('stream', (stream) => {
            addVideoStream(stream, call.peer);
        });
        addParticipant(roomId, isAdmin ? 'Admin' : 'User');
    }
};

// Handle Incoming Calls
peer.on('call', (call) => {
    call.answer(myStream);
    call.on('stream', (stream) => {
        addVideoStream(stream, call.peer);
    });
    addParticipant(call.peer, 'User');
});

// Add Video Stream for Peers
function addVideoStream(stream, peerId) {
    if (!connections[peerId]) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.setAttribute('data-peer', peerId);
        peersContainer.append(video);
        connections[peerId] = video;
    }
}

// Chat
const chatArea = document.getElementById('chat');
document.getElementById('send-message').onclick = () => {
    const message = chatArea.value;
    if (message) {
        Object.keys(connections).forEach(peerId => {
            // Send message to each peer (implementation depends on protocol)
            console.log(`Message sent to ${peerId}: ${message}`);
        });
        chatArea.value = "";  // Clear the chat area
    }
};

// Admin Controls (e.g., Mute/Remove Users)
function addParticipant(peerId, role) {
    const listItem = document.createElement('li');
    listItem.textContent = `${role} - ${peerId}`;
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
    console.log(`Toggling audio for ${peerId} - mute: ${mute}`);
}

function removeUser(peerId) {
    // Logic to remove the peer from call
    if (connections[peerId]) {
        connections[peerId].remove();
        delete connections[peerId];
    }
}
