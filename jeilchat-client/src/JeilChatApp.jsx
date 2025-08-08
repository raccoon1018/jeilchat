import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaCommentDots, FaPaperPlane } from 'react-icons/fa'
import { Button } from './components/ui/Button'
import { Input } from './components/ui/Input'
import io from 'socket.io-client'

const SOCKET_SERVER = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

export default function JeilChatApp() {
  const [username, setUsername] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const socketRef = useRef(null)

  useEffect(() => {
    if (isLoggedIn) {
      socketRef.current = io(SOCKET_SERVER)
      socketRef.current.emit('join', username)
      socketRef.current.on('message', (m) => setMessages((prev) => [...prev, m]))
      socketRef.current.on('system', (s) => setMessages((prev) => [...prev, { user: 'system', text: s }]))
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    }
  }, [isLoggedIn])

  const send = () => {
    if (!text) return
    socketRef.current.emit('message', text)
    setText('')
  }

  if (!isLoggedIn)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
        <div className="w-96 p-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-4">JEILCHAT</h1>
          <Input placeholder="이름을 입력하세요" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Button onClick={() => username.trim() && setIsLoggedIn(true)}>입장하기</Button>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <header className="w-full max-w-2xl p-4 bg-blue-600 text-white font-bold flex items-center gap-3 rounded-t-lg">
        <FaCommentDots /> JEILCHAT - 마산제일고
      </header>
      <main className="w-full max-w-2xl flex-1 p-4 overflow-auto space-y-2 bg-white rounded-b-lg shadow-md">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-2 rounded ${m.user === 'system' ? 'bg-yellow-100' : 'bg-blue-50'}`}
          >
            <strong>{m.user}</strong>: {m.text}
          </motion.div>
        ))}
      </main>
      <footer className="w-full max-w-2xl p-4 flex gap-2 border-t bg-white rounded-b-lg shadow-md">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="메시지를 입력하세요"
        />
        <Button onClick={send}>
          <FaPaperPlane />
        </Button>
      </footer>
      <div className="mt-2 text-xs text-gray-500">익명 채팅이지만 님들 IP는 상시 추적됩니다</div>
    </div>
  )
}
