// client/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      console.log('User UID:', user?.uid);
      console.log('User email:', user?.email);
      
      if (user) {
        try {
          // Force token refresh to ensure we have a valid token
          const token = await user.getIdToken(true);
          console.log('Token refreshed successfully, token length:', token?.length);
          
          // Validate token by checking its structure
          if (token && token.length > 100) {
            console.log('Token appears valid');
            
            // Wait longer to ensure Firebase Functions can process the token
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Test the token by making a simple call
            try {
              const testTokenResult = await user.getIdTokenResult();
              console.log('Token validation successful:', {
                expirationTime: testTokenResult.expirationTime,
                authTime: testTokenResult.authTime,
                issuedAtTime: testTokenResult.issuedAtTime
              });
            } catch (tokenTestError) {
              console.warn('Token validation failed:', tokenTestError);
            }
          } else {
            console.warn('Token appears invalid or too short');
          }
          
        } catch (error) {
          console.error('Error refreshing token:', error);
          
          // If token refresh fails, try to sign the user out and back in
          if (error.code === 'auth/network-request-failed' || 
              error.code === 'auth/internal-error') {
            console.log('Network error, will retry token refresh...');
            
            // Try one more time
            setTimeout(async () => {
              try {
                if (auth.currentUser) {
                  await auth.currentUser.getIdToken(true);
                  console.log('Token refresh retry successful');
                }
              } catch (retryError) {
                console.error('Token refresh retry failed:', retryError);
              }
            }, 3000);
          }
        }
      }
      
      setCurrentUser(user);
      setLoading(false);
      setAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  // Helper function to ensure user has valid token
  const ensureValidToken = async () => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const token = await currentUser.getIdToken(true);
      if (!token || token.length < 100) {
        throw new Error('Invalid token received');
      }
      return token;
    } catch (error) {
      console.error('Error ensuring valid token:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    authChecked,
    ensureValidToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}