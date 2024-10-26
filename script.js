const peer = new Peer();
let myStream;
const videoContainer = document.getElementById('video-container');
const peersContainer = document.getElementById('peers-container');
const adminControls = document.getElementById('admin-controls');
const participantList = document.getElementById('participant-list');
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendMessageButton = document.getElementById('send-message');
let connections = {};
let isAdmin = false;

peer.on('open', (id) => {
    document.getElementById('peer-id').textContent = id;
});

// Copy Peer ID
document.getElementById('copy-id').onclick = () => {
    navigator.clipboard.writeText(peer.id);
    alert("Peer ID copied to clipboard.");
};

// Dark Mode Toggle
document.getElementById('dark-mode-toggle').onclick = () => {
    document.body.classList.toggle('dark-mode');
};

// Initialize Media Stream
async function initializeStream() {
    myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('my-video').srcObject = myStream;
}

// Create Room
document.getElementById('create-room').onclick = async () => {
    await initializeStream();
    isAdmin = true;
    adminControls.style.display = 'block';
};

// Join Room
document.getElementById('join-room').onclick = async () => {
    const roomId = prompt("Enter Room ID:");
    if (roomId) {
        await initializeStream();
        const call = peer.call(roomId, myStream);
        setupCall(call);
    }
};

// Handle Incoming Calls
peer.on('call', (call) => {
    call.answer(myStream);
    setupCall(call);
});

// Add Participant
function setupCall(call) {
    call.on('stream', (stream) => addVideoStream(stream, call.peer));
    call.on('close', () => removeVideoStream(call.peer));
}

// Add Video Stream
function addVideoStream(stream, peerId) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.dataset.peerId = peerId;
    peersContainer.appendChild(video);
    connections[peerId] = { stream, video };

    if (isAdmin) addAdminControls(peerId);
}

// Add Admin Controls
function addAdminControls(peerId) {
    const participantItem = document.createElement('li');
    participantItem.textContent = `Participant ${peerId}`;
    
    const muteButton = document.createElement('button');
    muteButton.textContent = "Mute";
    muteButton.onclick = () => toggleMute(peerId, muteButton);

    const kickButton = document.createElement('button');
    kickButton.textContent = "Kick";
    kickButton.onclick = () => kickParticipant(peerId);

    participantItem.append(muteButton, kickButton);
    participantList.appendChild(participantItem);
}

// Mute Participant
function toggleMute(peerId, muteButton) {
    const stream = connections[peerId].stream;
    stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;
    muteButton.textContent = stream.getAudioTracks()[0].enabled ? "Mute" : "Unmute";
}

// Kick Participant
function kickParticipant(peerId) {
    if (connections[peerId]) {
        connections[peerId].video.remove();
        connections[peerId].stream.getTracks().forEach(track => track.stop());
        delete connections[peerId];
        alert(`Kicked Participant: ${peerId}`);
    }
}

// End Call
document.getElementById('end-call').onclick = () => {
    Object.values(connections).forEach(connection => {
        connection.video.remove();
        connection.stream.getTracks().forEach(track => track.stop());
    });
    connections = {};
    alert("Call Ended");
};
