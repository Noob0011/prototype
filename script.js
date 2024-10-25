const peer = new Peer();

const myVideo = document.getElementById('my-video');
const peerVideo = document.getElementById('peer-video');
const startCallButton = document.getElementById('start-call');
const connectButton = document.getElementById('connect');
const endCallButton = document.getElementById('end-call');
const muteAudioButton = document.getElementById('mute-audio');
const muteVideoButton = document.getElementById('mute-video');
const peerIdInput = document.getElementById('peer-id-input');
const chatArea = document.getElementById('chat');
const sendMessageButton = document.getElementById('send-message');

// Start video stream
let myStream;
startCallButton.onclick = async () => {
    myStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    myVideo.srcObject = myStream;
};

// Handle incoming connections
peer.on('open', (id) => {
    alert("Your Peer ID is: " + id); // Display your Peer ID for others to connect
});

peer.on('call', (call) => {
    call.answer(myStream); // Answer the call and send your video stream
    call.on('stream', (stream) => {
        peerVideo.srcObject = stream; // Display the peer's video stream
    });
});

// Connect to another peer
connectButton.onclick = () => {
    const peerId = peerIdInput.value;
    if (peerId && myStream) {
        const call = peer.call(peerId, myStream);
        call.on('stream', (stream) => {
            peerVideo.srcObject = stream;
        });
    } else {
        alert("Please start your video and enter a Peer ID.");
    }
};

// Mute/Unmute audio
let isAudioMuted = false;
muteAudioButton.onclick = () => {
    isAudioMuted = !isAudioMuted;
    myStream.getAudioTracks()[0].enabled = !isAudioMuted;
    muteAudioButton.textContent = isAudioMuted ? "Unmute Audio" : "Mute Audio";
};

// Mute/Unmute video
let isVideoMuted = false;
muteVideoButton.onclick = () => {
    isVideoMuted = !isVideoMuted;
    myStream.getVideoTracks()[0].enabled = !isVideoMuted;
    muteVideoButton.textContent = isVideoMuted ? "Unmute Video" : "Mute Video";
};

// End call
endCallButton.onclick = () => {
    peer.disconnect();
    myVideo.srcObject = null;
    peerVideo.srcObject = null;
    alert("Call ended.");
};

// Handle text chat
sendMessageButton.onclick = () => {
    const message = chatArea.value;
    if (message) {
        // For simplicity, we will log the message. You can extend this to send messages over WebRTC.
        console.log("Message sent:", message);
        chatArea.value = ""; // Clear the chat area
    } else {
        alert("Please type a message.");
    }
};
