import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, BookOpen } from 'lucide-react';

import { useFirebase } from './FirebaseProvider';

interface LoginViewProps {
  onLogin: () => Promise<void>;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const { user: firebaseUser, error: firebaseError } = useFirebase();
  const [isLoading, setIsLoading] = use