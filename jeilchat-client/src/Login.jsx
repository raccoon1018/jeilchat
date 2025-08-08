import React, { useState } from "react";
import Input from "./components/ui/Input";
import Button from "./components/ui/Button";

export default function Login({ onLogin }) {
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('');

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h2 className="text-center text-2xl font-bold mb-4">JEILCHAT 로그인</h2>
        <Input
          placeholder="이름을 입력하세요 (2자 이상)"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <Input
          type="password"
          placeholder="관리자 비밀번호 (선택)"
          value={adminKey}
          onChange={e => setAdminKey(e.target.value)}
          className="mt-2"
        />
        <Button
          className="mt-4 w-full"
          onClick={() => onLogin(name.trim(), adminKey.trim())}
        >
          로그인
        </Button>
      </div>
      <div className="mt-4 text-gray-500 text-center text-xs max-w-sm">
        * 관리자 비밀번호를 입력하면 관리자 모드로 전환됨.
      </div>
    </div>
  );
}
