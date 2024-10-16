// app.js
const socket = io();

let localStream;
let peerConnection;
const config = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

async function startCall() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById('localVideo').srcObject = localStream;

    peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal', { target: otherUserId, signal: event.candidate });
        }
    };

    peerConnection.ontrack = (event) => {
        document.getElementById('remoteVideo').srcObject = event.streams[0];
    };

    // Create offer and send it
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('signal', { target: otherUserId, signal: offer });
}

socket.on('signal', async (data) => {
    if (data.signal) {
        if (data.signal.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.emit('signal', { target: data.sender, signal: answer });
        } else {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.signal));
        }
    }
});
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    socket.emit('sendMessage', message);
    document.getElementById('messageInput').value = '';
}

socket.on('receiveMessage', (msg) => {
    const messageArea = document.getElementById('messageArea');
    messageArea.innerHTML += `<div>${msg}</div>`;
});

startCall(); // Call this function to start the video call

