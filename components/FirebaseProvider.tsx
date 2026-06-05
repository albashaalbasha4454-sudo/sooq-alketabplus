import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, type FirebaseUser, db, doc, getDoc, setDoc, collection, query, where, getDocs } from '../firebase';
import type { User } from '../types';
import { simpleHash } from '../utils/authUtils';

interface FirebaseContextType {
  user: FirebaseUser | null;
  currentUser: User | null;
  loading: boolean;
  is