const peer = new Peer();
const myVideo = document.getElementById('my-video');
const peersContainer = document.getElementById('peers-container');
const peerIdElement = document.getElementById('peer-id');
const copyIdButton = document.getElementById('copy-id');
const themeToggle = document.getElementById('theme-toggle');
let myStream;
let connections = {};

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
    }
};

// Handle Incoming Calls
peer.on('call', (call) => {
    call.answer(myStream);
    call.on('stream', (stream) => {
        addVideoStream(stream, call.peer);
    });
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

// End Call
document.getElementById('end-call').onclick = () => {
    peer.disconnect();
    myVideo.srcObject = null;
    Object.values(connections).forEach(video => {
        video.remove();
    });
    connections = {};
};

// Chat functionality can be integrated similarly, expanding based on peers.
