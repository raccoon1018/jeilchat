import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { FaPaperPlane, FaTrash, FaExclamationTriangle, FaHome } from "react-icons/fa";
import Login from "./Login";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";

const socket = io("http://localhost:3000"); // 배포 시 주소 변경 필요

export default function JeilChatApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);
  const [notice, setNotice] = useState('');
  const [noticeInput, setNoticeInput] = useState('');

  useEffect(() => {
    socket.on('init', ({ messages, notice }) => {
      setMessages(messages);
      setNotice(notice);
    });

    socket.on('loginSuccess', ({ isAdmin }) => {
      setLoggedIn(true);
      setIsAdmin(isAdmin);
    });

    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('deleteMessage', (id) => {
      setMessages((prev) => prev.filter(m => m.id !== id));
    });

    socket.on('reportMessage', (id) => {
      setMessages((prev) => prev.map(m => m.id === id ? { ...m, reported: true } : m));
    });

    socket.on('setNotice', (newNotice) => {
      setNotice(newNotice);
    });

    return () => {
      socket.off();
    };
  }, []);

  const login = (loginName, adminKey) => {
    if (loginName.length < 2 && adminKey === '') {
      alert('닉네임은 2자 이상 입력해주세요.');
      return;
    }
    socket.emit('login', { name: loginName, adminKey });
    setName(loginName);
  };

  const send = () => {
    if (text.trim() === '') return;
    socket.emit('sendMessage', text);
    setText('');
  };

  const deleteMsg = (id) => {
    if(window.confirm('정말 삭제하시겠습니까?')){
      socket.emit('deleteMessage', id);
    }
  };

  const reportMsg = (id) => {
    if(window.confirm('정말 신고하시겠어요?')){
      socket.emit('reportMessage', id);
    }
  };

  const setAdminNotice = () => {
    socket.emit('setNotice', noticeInput);
    setNoticeInput('');
  };

  if (!loggedIn) return <Login onLogin={login} />;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <header className="w-full max-w-2xl p-4 bg-blue-700 text-white font-bold flex items-center gap-3 rounded-t-lg">
        <FaHome className="cursor-pointer" onClick={() => window.location.reload()} />
        JEILCHAT - 마산제일고
      </header>

      {notice && (
        <div className="w-full max-w-2xl bg-yellow-300 text-black p-3 rounded text-center font-semibold">
          📢 공지: {notice}
        </div>
      )}

      <main className="w-full max-w-2xl flex-1 p-4 overflow-auto space-y-2 bg-white rounded-b-lg shadow-md">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded flex justify-between items-center ${m.user === '관리자' ? 'bg-green-100' : (m.reported ? 'bg-red-100' : 'bg-blue-50')}`}
          >
            <div>
              <strong>{m.user}</strong>: {m.text}
            </div>
            <div className="flex gap-2">
              {!isAdmin && !m.reported && (
                <button title="신고" onClick={() => reportMsg(m.id)} className="text-red-600 hover:text-red-900">
                  <FaExclamationTriangle />
                </button>
              )}
              {isAdmin && (
                <button title="삭제" onClick={() => deleteMsg(m.id)} className="text-gray-700 hover:text-black">
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        ))}
      </main>

      <footer className="w-full max-w-2xl p-4 flex gap-2 border-t bg-white rounded-b-lg shadow-md flex-col">
        {isAdmin && (
          <div className="mb-2 flex gap-2">
            <Input
              value={noticeInput}
              onChange={(e) => setNoticeInput(e.target.value)}
              placeholder="공지 내용을 입력하세요"
            />
            <Button onClick={setAdminNotice}>공지 설정</Button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="메시지를 입력하세요"
          />
          <Button onClick={send}>
            <FaPaperPlane />
          </Button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          익명 채팅이지만 님들 IP는 상시 추적되니 주의 ㅎㅎ
        </div>

        <div className="text-xs text-gray-400 text-center mt-1">
          ver1.0 Build 250809
        </div>
      </footer>
    </div>
  );
}
