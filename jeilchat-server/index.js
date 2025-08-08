const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.get('/', (req, res) => res.send('Jeilchat socket server'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('user connected', socket.id);
  socket.on('join', (username) => {
    socket.username = username;
    socket.broadcast.emit('system', `${username}님이 입장했습니다.`);
  });
  socket.on('message', (msg) => {
    const payload = { user: socket.username || '익명', text: msg, ts: Date.now() };
    io.emit('message', payload);
  });
  socket.on('disconnect', () => {
    if (socket.username) io.emit('system', `${socket.username}님이 퇴장했습니다.`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Jeilchat server listening on ${PORT}`));
