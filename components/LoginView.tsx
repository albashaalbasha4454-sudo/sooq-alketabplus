import { useState } from 'react';

type Props = { onLogin: () => Promise<void> };

const ACCESS_WORD = import.meta.env.VITE_LOGIN_WORD || 'admin';
const ACCESS_CODE = import.meta.env.VITE_LOGIN_CODE || '1234';

export default function LoginView({ onLogin }: Props) {
  const [word, setWord] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit