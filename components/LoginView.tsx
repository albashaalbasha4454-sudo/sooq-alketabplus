import React from 'react';

interface LoginViewProps {
  onLogin: () => Promise<void>;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await onLogin();
    } catch {
      setError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');