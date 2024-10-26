const peer = new Peer();
let myStream;
const myVideo = document.getElementById('my-video');
const peerIdElement = document.getElementById('peer-id');
const copyIdButton = document.getElementById('copy-id');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const endCallButton = document.getElementById('end-call');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const peersContainer = document.getElementById('peers-container');
const adminControls = document.getElementById('admin-controls');
const participantList = document.getElementById('participant-list');

let connections = {};
let isAdmin = false;

// Toggle Dark Mode
darkModeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
};

// Display Peer ID when available
peer.on('open', (id) => {
    peerIdElement.textContent = id;
    console.log('Your Peer ID:', id);
});

// Copy Peer ID to clipboard
copyIdButton.onclick = () => {
    navigator.clipboard.writeText(peerIdElement.textContent)
        .then(() => alert('Peer ID copied!'));
};

// Initialize Media and Stream for Room
async function initializeStream() {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        myVideo.srcObject = myStream;
    } catch (error) {
        console.error('Media error:', error);
        alert('Check camera/microphone permissions');
    }
}

// Start Video Stream as Room Admin
createRoomButton.onclick = async () => {
    isAdmin = true;
    adminControls.style.display = 'block';
    await initializeStream();
};

// Join a Room as Guest
joinRoomButton.onclick = async () => {
    const roomId = document.getElementById('room-id-input').value.trim();
    if (!roomId) {
        alert('Please enter a Room ID');
        return;
    }
    await initializeStream();
    const call = peer.call(roomId, myStream);
    handleIncomingCall(call);
};

// Handle Incoming Calls and Streams
peer.on('call', (call) => {
    call.answer(myStream);
    handleIncomingCall(call);
});

function handleIncomingCall(call) {
    call.on('stream', (stream) => addParticipantStream(stream, call.peer));
    call.on('close', () => removeParticipant(call.peer));
}

// Add Participant Stream to UI
function addParticipantStream(stream, peerId) {
    if (connections[peerId]) return;

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.dataset.peerId = peerId;
    peersContainer.appendChild(video);
    connections[peerId] = { stream, video };

    if (isAdmin) addAdminControls(peerId);
}

// Admin Controls for Mute, Kick, and Manage Participants
function addAdminControls(peerId) {
    const participantItem = document.createElement('li');
    participantItem.textContent = `Participant: ${peerId}`;

    const muteButton = document.createElement('button');
    muteButton.textContent = 'Mute';
    muteButton.onclick = () => toggleMute(peerId, muteButton);

    const kickButton = document.createElement('button');
    kickButton.textContent = 'Kick';
    kickButton.onclick = () => kickParticipant(peerId, participantItem);

    participantItem.appendChild(muteButton);
    participantItem.appendChild(kickButton);
    participantList.appendChild(participantItem);
}

function toggleMute(peerId, button) {
    const participant = connections[peerId];
    if (participant && participant.stream) {
        const audioTracks = participant.stream.getAudioTracks();
        audioTracks.forEach(track => track.enabled = !track.enabled);
        button.textContent = track.enabled ? 'Mute' : 'Unmute';
    }
}

function kickParticipant(peerId, participantItem) {
    if (connections[peerId]) {
        connections[peerId].video.remove();
        participantItem.remove();
        delete connections[peerId];
    }
}

// End Call for All (Admin Only)
endCallButton.onclick = () => {
    if (isAdmin) {
        Object.values(connections).forEach(connection => connection.video.remove());
        connections = {};
        alert('Call ended');
    }
};
