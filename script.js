const peer = new Peer();
let myStream;
const myVideo = document.getElementById('my-video');
const peerIdElement = document.getElementById('peer-id');
const copyIdButton = document.getElementById('copy-id');

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

// Start Video Stream
document.getElementById('start-call').onclick = async () => {
    try {
        myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        myVideo.srcObject = myStream;
    } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Could not start video. Please check camera and microphone permissions.');
    }
};

// Connect to a Room
document.getElementById('connect').onclick = () => {
    const roomId = document.getElementById('room-id-input').value.trim();
    if (!roomId) {
        alert('Please enter a Room ID to connect');
        return;
    }

    const call = peer.call(roomId, myStream);
    call.on('stream', (stream) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        document.getElementById('peers-container').appendChild(video);
    });
};

// Handle Incoming Calls
peer.on('call', (call) => {
    call.answer(myStream);
    call.on('stream', (remoteStream) => {
        const video = document.createElement('video');
        video.srcObject = remoteStream;
        video.autoplay = true;
        document.getElementById('peers-container').appendChild(video);
    });
});
