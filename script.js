const peer = new Peer();
let myStream;
const videoContainer = document.getElementById('video-container');
const participants = document.getElementById('participants');
const participantsList = document.getElementById('participants-list');
let connections = {};
let isAdmin = false;

// Get peer ID
peer.on('open', id => {
    document.getElementById('peer-id').textContent = id;
});

// Toggle Dark Mode
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
    document.getElementById('admin-controls').style.display = 'block';
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
peer.on('call', call => {
    call.answer(myStream);
    setupCall(call);
});

function setupCall(call) {
    call.on('stream', stream => addVideoStream(stream, call.peer));
    call.on('close', () => removeVideoStream(call.peer));
}

function addVideoStream(stream, peerId) {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.dataset.peerId = peerId;
    participants.appendChild(video);
    connections[peerId] = { stream, video };

    if (isAdmin) addAdminControls(peerId);
}

function removeVideoStream(peerId) {
    if (connections[peerId]) {
        connections[peerId].video.remove();
        delete connections[peerId];
    }
}

function addAdminControls(peerId) {
    const listItem = document.createElement('li');
    listItem.textContent = `Participant ${peerId}`;

    const muteButton = document.createElement('button');
    muteButton.textContent = 'Mute';
    muteButton.onclick = () => toggleMute(peerId, muteButton);

    const kickButton = document.createElement('button');
    kickButton.textContent = 'Kick';
    kickButton.onclick = () => kickParticipant(peerId);

    listItem.appendChild(muteButton);
    listItem.appendChild(kickButton);
    participantsList.appendChild(listItem);
}

function toggleMute(peerId, button) {
    const stream = connections[peerId].stream;
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
    button.textContent = audioTrack.enabled ? 'Mute' : 'Unmute';
}

function kickParticipant(peerId) {
    if (connections[peerId]) {
        connections[peerId].video.remove();
        connections[peerId].stream.getTracks().forEach(track => track.stop());
        delete connections[peerId];
    }
    alert(`Kicked Participant: ${peerId}`);
}

document.getElementById('end-call').onclick = () => {
    Object.values(connections).forEach(connection => {
        connection.video.remove();
        connection.stream.getTracks().forEach(track => track.stop());
    });
    connections = {};
    alert('Call Ended');
};
