// ==== server.js ====
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const lobby = [];
const callPairs = new Map();
const connectedUsers = new Set();
const socketToUidMap = new Map();
const uidToSocketMap = new Map();

function tryPairUsers() {
  while (lobby.length >= 2) {
    const user1 = lobby.shift();
    const user2 = lobby.shift();

    callPairs.set(user1, user2);
    callPairs.set(user2, user1);

    io.to(user1).emit('found-partner', {
      partnerId: user2,
      isInitiator: true,
      partnerUid: socketToUidMap.get(user2)
    });
    io.to(user2).emit('found-partner', {
      partnerId: user1,
      isInitiator: false,
      partnerUid: socketToUidMap.get(user1)
    });

    console.log(`[SERVER] Paired users: ${user1} <--> ${user2}`);
  }
}

io.on('connection', (socket) => {

  socket.on('register-user', ({ uid }) => {
    uidToSocketMap.set(uid, socket.id);
    socketToUidMap.set(socket.id, uid);
    console.log(`[SERVER] Registered user ${uid} with socket ${socket.id}`);
  
    if (!lobby.includes(socket.id)) {
      lobby.push(socket.id);
      tryPairUsers();
    }
  });

  socket.on('send-offer', ({ target, offer }) => {
    console.log(`[SERVER] Offer from ${socket.id} to ${target}`);
    io.to(target).emit('receive-offer', { from: socket.id, offer });
  });

  socket.on('send-answer', ({ target, answer }) => {
    console.log(`[SERVER] Answer from ${socket.id} to ${target}`);
    io.to(target).emit('receive-answer', { from: socket.id, answer });
  });

  socket.on('ice-candidate', ({ target, candidate }) => {
    console.log(`[SERVER] ICE candidate from ${socket.id} to ${target}`);
    io.to(target).emit('ice-candidate', { from: socket.id, candidate });
  });
  socket.on('in-call-message', ({ target, message }) => {
    io.to(target).emit('in-call-message', { message });
  });
  socket.on('end-call', () => {
    const partnerId = callPairs.get(socket.id);
    console.log(`[SERVER] Call ended by ${socket.id}`);
  
    if (partnerId) {
      io.to(partnerId).emit('call-ended');
  
      // Clean up call pairs
      callPairs.delete(socket.id);
      callPairs.delete(partnerId);
  
      // Send partner back to lobby
      if (!lobby.includes(partnerId)) {
        lobby.push(partnerId);
      }
  
      tryPairUsers(); // Try to pair the leftover user
    } else {
      callPairs.delete(socket.id);
    }
  });

  socket.on('skip-call', () => {
    const partnerId = callPairs.get(socket.id);
    console.log(`[SERVER] Call skipped by ${socket.id}`);
  
    if (partnerId) {
      io.to(partnerId).emit('call-ended'); // Tell partner the call is ending
  
      // Clean up existing pair
      callPairs.delete(socket.id);
      callPairs.delete(partnerId);
  
      // Put both users back into the lobby
      lobby.push(socket.id);
      lobby.push(partnerId);
  
      tryPairUsers();
    } else {
      // No partner? Just push the user to lobby
      if (!lobby.includes(socket.id)) {
        lobby.push(socket.id);
        tryPairUsers();
      }
    }
  });
  

  socket.on('disconnect', () => {
    console.log(`[SERVER] Socket disconnected: ${socket.id}`);
    connectedUsers.delete(socket.id);
    const partnerId = callPairs.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit('call-ended');
      callPairs.delete(partnerId);
    }
    callPairs.delete(socket.id);
    const index = lobby.indexOf(socket.id);
    if (index !== -1) lobby.splice(index, 1);
  });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log('Server running on http://localhost:3001');
});
