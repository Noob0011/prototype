// Set up PeerJS with a free PeerJS cloud server
const peer = new Peer();

// Elements from HTML
const myVideo = document.getElementById('my-video');
const peerVideo = document.getElementById('peer-video');
const startCallButton = document.getElementById('start-call');
const connectButton = document.getElementById('connect');
const peerIdInput = document.getElementById('peer-id-input');

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
    // Answer the call and send your video stream
    call.answer(myStream);

    // Receive the peer's video stream
    call.on('stream', (stream) => {
        peerVideo.srcObject = stream;
    });
});

// Connect to another peer
connectButton.onclick = () => {
    const peerId = peerIdInput.value;
    if (peerId && myStream) {
        const call = peer.call(peerId, myStream);
        
        // Display the peer's video stream
        call.on('stream', (stream) => {
            peerVideo.srcObject = stream;
        });
    } else {
        alert("Please start your video and enter a Peer ID.");
    }
};