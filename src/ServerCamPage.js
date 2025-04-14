import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Textarea, Group, Box, Text, Chip, InputLabel } from '@mantine/core';
import io from 'socket.io-client';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { auth } from "../src/Auth/Firebase";
import './ServerCamPage.css'; // Import CSS for styling

const db = getFirestore(getApp());
const controlButtonStyle = {
  fontSize: '1.5rem',
  color: 'white',
  textDecoration: 'underline',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
};
const ServerCamPage = () => {
  const [partnerId, setPartnerId] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [isInitiator, setIsInitiator] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const pendingCandidates = useRef([]);
  const socketRef = useRef();
  const peerConnectionRef = useRef(null);
  const hasStream = useRef(false);
  const hasConnectionStarted = useRef(false);
  const remoteVideoRef = useRef();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);
  const [partnerAudioMuted, setPartnerAudioMuted] = useState(false);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!localStream || !partnerId || peerConnectionRef.current) return;

    console.log('[CLIENT] Both localStream and partnerId are ready, creating peer connection');
    createPeerConnection();

    if (isInitiator) {
      peerConnectionRef.current
        .createOffer()
        .then((offer) => peerConnectionRef.current.setLocalDescription(offer))
        .then(() => {
          socketRef.current.emit('send-offer', {
            target: partnerId,
            offer: peerConnectionRef.current.localDescription,
          });
          console.log('[CLIENT] Offer created and sent');
        })
        .catch((err) => console.error('[CLIENT] Error during offer creation:', err));
    }
  }, [localStream, partnerId, isInitiator]);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('connect', async () => {
      console.log('[CLIENT] Connected to socket with ID:', socketRef.current.id);

      const user = auth.currentUser;
      if (user) {
        socketRef.current.emit('register-user', { uid: user.uid });
        console.log('[CLIENT] Sent UID to server:', user.uid);
      }
    });

    socketRef.current.on('found-partner', async ({ partnerId: newPartnerId, isInitiator, partnerUid }) => {
      console.log(`[CLIENT] Partner found: ${newPartnerId}, Role: ${isInitiator ? 'Initiator' : 'Responder'}`);
      setPartnerId(newPartnerId);
      setIsInitiator(isInitiator);

      if (partnerUid) {
        fetchPartnerInfo(partnerUid);
      }

      if (!hasStream.current) {
        await setupMedia();
        hasStream.current = true;
      }

      if (!peerConnectionRef.current) {
        createPeerConnection();
      }

      if (isInitiator && peerConnectionRef.current) {
        try {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          console.log('[CLIENT] Offer created');
          socketRef.current.emit('send-offer', { target: newPartnerId, offer });
        } catch (error) {
          console.error('[CLIENT] Error creating offer:', error);
        }
      }
    });

    socketRef.current.on('receive-offer', async ({ from, offer }) => {
      console.log(`[CLIENT] Offer received from ${from}`);
      setPartnerId(from);

      if (!peerConnectionRef.current) {
        createPeerConnection();
      }

      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(offer);
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        console.log('[CLIENT] Answer created');
        socketRef.current.emit('send-answer', { target: from, answer });
      }
    });

    socketRef.current.on('receive-answer', async ({ from, answer }) => {
      console.log(`[CLIENT] Answer received from ${from}`);
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    });

    socketRef.current.on('ice-candidate', ({ from, candidate }) => {
      console.log(`[CLIENT] ICE candidate received from ${from}`);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socketRef.current.on('in-call-message', ({ message }) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('call-ended', () => {
      console.log('[CLIENT] Call ended');
      endConnection();
    });

    return () => {
      console.log('[CLIENT] Component unmounted, cleaning up');
      endConnection();
      socketRef.current.disconnect();
    };
  }, []);

  const fetchPartnerInfo = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPartnerInfo(docSnap.data());
      } else {
        console.warn('[CLIENT] Partner doc not found');
      }
    } catch (err) {
      console.error('[CLIENT] Error fetching partner info:', err);
    }
  };

  const setupMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
    } catch (error) {
      console.error('[CLIENT] Error accessing media devices:', error);
    }
  };

  const createPeerConnection = () => {
    if (peerConnectionRef.current || !localStream) return;
    const pcConfig = {
      iceServers: [
        {
          urls: ["stun:us-turn9.xirsys.com"],
        },
        {
          username: "qLhhxQbV8iV8YkXR6r0YyqiNNTtH2EGPkkZwWLmmKAfJS3n17H1Yp3ZBO7qV_T7vAAAAAGf9O2BkbXJvYjE5OTc=",
          credential: "b43f0778-194f-11f0-b01f-0242ac140004",
          urls: [
            "turn:us-turn9.xirsys.com:3478?transport=tcp",
          ],
        },
      ],
    };
    const pc = new RTCPeerConnection(pcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (!peerConnectionRef.current.remoteDescription) {
          pendingCandidates.current.push(event.candidate);
        } else {
          socketRef.current.emit('ice-candidate', {
            target: partnerId,
            candidate: event.candidate,
          });
        }
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    peerConnectionRef.current = pc;

    if (pendingCandidates.current.length > 0 && peerConnectionRef.current.remoteDescription) {
      pendingCandidates.current.forEach((candidate) => {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      });
      pendingCandidates.current = [];
    }
  };

  const endConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setMessages([]);
    setNewMessage('');
    setRemoteStream(null);
    setPartnerId(null);
    setIsInitiator(null);
    setPartnerInfo(null);
    hasConnectionStarted.current = false;
    hasStream.current = false;

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  };

  const handleEndCall = () => {
    setMessages([]);
    setNewMessage('');
    socketRef.current.emit('end-call');
    endConnection();
    window.location.href = '/';
  };

  const handleSkip = () => {
    socketRef.current.emit('skip-call');
    setMessages([]);
    setNewMessage('');
    endConnection();
  };

  const sendMessage = (text) => {
    if (text.trim()) {
      const msg = { from: socketRef.current.id, text };
      socketRef.current.emit('in-call-message', { target: partnerId, message: msg });
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
    }
  };
const toggleMic = () => {
  localStream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
    setMicEnabled(track.enabled);
  });
};

const toggleCam = () => {
  localStream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
    setCamEnabled(track.enabled);
  });
};

const togglePartnerAudio = () => {
  if (remoteVideoRef.current) {
    remoteVideoRef.current.muted = !partnerAudioMuted;
    setPartnerAudioMuted(!partnerAudioMuted);
  }
};

const handleReport = () => {
  alert("User reported. Thank you.");
  // You can integrate actual report logic (e.g. API call) here.
};
  return (
    <div
    style={{
      border: '1px solid #ced4da',
      borderRadius: '10px',
      display: 'flex',
      position: 'relative',
      padding: '20px',
      height: '100%',
      width: '100%',
    }}
    className="contain"
  >
    {/* Fullscreen Waiting Overlay */}
    {!partnerInfo && (
      <div
        className="waiting-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px'
        }}
      >
        <div
          style={{
            border: '8px solid #f3f3f3',
            borderTop: '8px solid #40c057',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px',
          }}
        />
        <Input.Label style={{ fontSize: '1.5rem', color: '#40c057' }}>
          Finding Partner...
        </Input.Label>
      </div>
    )}
  
    {/* Video & Controls */}
    <div style={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', paddingRight: '10px' }}>
      {/* Local Video */}
      <div style={{ position: 'relative', width: '100%', height: '150px', marginBottom: '10px' }}>
        {localStream && (
          <video
            autoPlay
            playsInline
            muted
            ref={(video) => video && (video.srcObject = localStream)}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              borderRadius: '10px',
            }}
          />
        )}
        <div className="hover-controls">
          <button style={controlButtonStyle} onClick={toggleMic}>
            {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
          </button>
          <button style={controlButtonStyle} onClick={toggleCam}>
            {camEnabled ? 'Turn Off Cam' : 'Turn On Cam'}
          </button>
        </div>
      </div>
  
      {/* Remote Video */}
      <div style={{ position: 'relative', width: '100%', height: '150px' }}>
        {remoteStream && (
          <>
            <video
              autoPlay
              playsInline
              ref={remoteVideoRef}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                borderRadius: '10px',
              }}
            />
            <div className="hover-controls">
              <button style={controlButtonStyle} onClick={togglePartnerAudio}>
                {partnerAudioMuted ? 'Unmute Partner' : 'Mute Partner'}
              </button>
              <button style={{ ...controlButtonStyle, color: 'red' }} onClick={handleReport}>
                Report
              </button>
            </div>
          </>
        )}
      </div>
  
      {/* Call Controls */}
      <Group spacing="sm" style={{ marginTop: '10px' }}>
        <Button variant="gradient" gradient={{ from: 'green', to: 'lightgreen' }} onClick={handleEndCall}>
          End Call
        </Button>
        <Button variant="gradient" gradient={{ from: 'green', to: 'lightgreen' }} onClick={handleSkip}>
          Skip
        </Button>
      </Group>
    </div>
  
    {/* Partner Info & Messages */}
    <div style={{ flex: '0 0 70%' }}>
      <div
        className="messages"
        style={{
          height: '500px',
          width: '100%',
          overflowY: 'auto',
          padding: '10px',
          borderRadius: '10px',
          border: '1px solid #ced4da',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {partnerInfo && (
          <div className="info" style={{ display: 'flex', flexDirection: 'column' }}>
            <Box style={{ flex: 1 }}>
              <Text weight={600} style={{ fontSize: '1.5rem' }}>
                {partnerInfo.displayName}, {partnerInfo.country}
              </Text>
            </Box>
            <div>
              <Text weight={500} style={{ fontSize: '1.5rem', color: 'black' }}>Native Language:</Text>
              <Text style={{ fontSize: '1.5rem', color: '#555' }}>
                {partnerInfo.nativeLanguage?.map(lang => lang.label).join(', ')}
              </Text>
              <Text weight={500} style={{ fontSize: '1.5rem', color: 'black' }}>Languages Learning:</Text>
              <Text style={{ fontSize: '1.5rem', color: '#555' }}>
                {partnerInfo.languagesLearning?.map(lang => lang.label).join(', ')}
              </Text>
            </div>
          </div>
        )}
  
        <div style={{ flexGrow: 1 }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <Input.Label
                style={{
                  color: msg.from === socketRef.current.id ? 'green' : 'red',
                  fontSize: '1.5rem',
                }}
              >
                {msg.from === socketRef.current.id ? 'You: ' : 'Partner: '}
                {msg.text}
              </Input.Label>
            </div>
          ))}
        </div>
  
        {/* Message Input */}
        
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <Input
            placeholder="Type your message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(newMessage) }}
            style={{ flexGrow: 1 }}
          />
          <Button
            variant="gradient"
            gradient={{ from: 'green', to: 'lightgreen' }}
            onClick={() => sendMessage(newMessage)}
          >
            Send
          </Button>
        </div>
    </div>
  </div>
  
  );
};

export default ServerCamPage;
