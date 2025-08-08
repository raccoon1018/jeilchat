import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json()); // JSON 바디 파싱

app.get('/', (req, res) => {
  res.send('Jeilchat socket server');
});

// MongoDB 연결 설정
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://raccoon1018:yoon1010@cluster0.r5933ul.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(MONGO_URI);

let messagesCollection;
let noticesCollection;

async function start() {
  try {
    await client.connect();
    const db = client.db('jeilchat');
    messagesCollection = db.collection('messages');
    noticesCollection = db.collection('notices');

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: '*' }
    });

    io.on('connection', async (socket) => {
      console.log('user connected', socket.id);

      // DB에서 메시지와 공지 불러와서 클라이언트에 초기 데이터 전송
      const messages = await messagesCollection.find().sort({ ts: 1 }).toArray();
      const noticeDoc = await noticesCollection.findOne({}, { sort: { _id: -1 } });
      socket.emit('init', { messages, notice: noticeDoc ? noticeDoc.text : '' });

      socket.on('login', ({ name, adminKey }) => {
        socket.username = name;
        socket.isAdmin = adminKey === 'Tlqkf1010?!'; // 관리자 비밀번호 체크
        socket.emit('loginSuccess', { isAdmin: socket.isAdmin });
        io.emit('system', { user: 'system', text: `${name}님이 입장했습니다.`, ts: Date.now(), id: uuidv4() });
      });

      socket.on('sendMessage', async (text) => {
        const msg = {
          id: uuidv4(),
          user: socket.isAdmin ? '관리자' : socket.username || '익명',
          text,
          ts: Date.now(),
          reported: false,
        };
        await messagesCollection.insertOne(msg);
        io.emit('newMessage', msg);
      });

      socket.on('deleteMessage', async (id) => {
        if (!socket.isAdmin) return; // 관리자만 삭제 가능
        await messagesCollection.deleteOne({ id });
        io.emit('deleteMessage', id);
      });

      socket.on('reportMessage', async (id) => {
        await messagesCollection.updateOne({ id }, { $set: { reported: true } });
        io.emit('reportMessage', id);
      });

      socket.on('setNotice', async (text) => {
        if (!socket.isAdmin) return;
        const notice = { text, ts: Date.now() };
        await noticesCollection.insertOne(notice);
        io.emit('setNotice', text);
      });

      socket.on('disconnect', () => {
        if (socket.username) {
          io.emit('system', { user: 'system', text: `${socket.username}님이 퇴장했습니다.`, ts: Date.now(), id: uuidv4() });
        }
      });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Jeilchat server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

start();
