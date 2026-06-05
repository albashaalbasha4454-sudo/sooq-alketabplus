import React, { useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { useFirebase } from './FirebaseProvider';

interface LoginViewProps {
  onLogin: () => Promise<void>;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const { error: firebaseError } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleLogin = async () => {
    setLocalError('');
    setIsLoading(true);