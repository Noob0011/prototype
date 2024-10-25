const peer = new Peer();
let myStream;
const myVideo = document.getElementById('my-video');
const peerIdElement = document.getElementById('peer-id');
const copyIdButton = document.getElementById('copy-id');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const peersContainer = document.getElementById('peers-container');

let connections = {};
let isAdmin = false;

// Toggle Dark Mode
darkModeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    document.getElementById('app').classList.toggle('dark-mode');
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

// Start Video Stream for Room Creation
createRoomButton.onclick = async () => {
    isAdmin = true;
    try {
        myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        myVideo.srcObject = myStream;
        myVideo.style.border = "2px solid #0b5ed7";  // Admin styling
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Could not start video. Please check camera and microphone permissions.');
    }
};

// Join a Room as Guest
joinRoomButton.onclick = async () => {
    const roomId = document.getElementById('room-id-input').value.trim();
    if (!roomId) {
        alert('Please enter a valid Room ID to join');
        return;
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        myVideo.srcObject = myStream;

        const call = peer.call(roomId, myStream);
        call.on('stream', (stream) => addVideoStream(stream, call.peer));
    } catch (error) {
        console.error('Error joining room:', error);
    }
};

// Add Video Stream to DOM and Avoid Duplicate Entries
function addVideoStream(stream, peerId) {
    if (connections[peerId]) return; // Prevent duplicate video
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.dataset.peerId = peerId;
    peersContainer.appendChild(video);
    connections[peerId] = stream;
}

// Answer Incoming Calls
peer.on('call', (call) => {
    call.answer(myStream);
    call.on('stream', (remoteStream) => addVideoStream(remoteStream, call.peer));
});
