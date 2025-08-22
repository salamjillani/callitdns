import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

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
    console.log("Setting up auth state listener...");

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("=== AUTH STATE CHANGE ===");
      console.log("User status:", user ? "logged in" : "logged out");

      if (user) {
        console.log("User details:", {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          providerData: user.providerData?.length || 0,
        });

        try {
          // Always get a fresh token when auth state changes
          console.log("Getting fresh token after auth change...");
          const token = await user.getIdToken(true);

          console.log("Token obtained:", {
            length: token?.length,
            valid: token && token.length > 500,
          });

          // Validate token structure
          if (token && token.length > 500) {
            console.log("Token appears valid, checking claims...");

            try {
              const tokenResult = await user.getIdTokenResult();
              console.log("Token validation successful:", {
                expirationTime: new Date(
                  tokenResult.expirationTime
                ).toISOString(),
                authTime: new Date(tokenResult.authTime).toISOString(),
                issuedAtTime: new Date(tokenResult.issuedAtTime).toISOString(),
                claims: Object.keys(tokenResult.claims || {}),
              });

              // Set user only after successful token validation
              setCurrentUser(user);
            } catch (tokenTestError) {
              console.error("Token validation failed:", tokenTestError);
              // Still set the user, but log the issue
              setCurrentUser(user);
            }
          } else {
            console.warn("Token appears invalid or too short");
            setCurrentUser(user); // Still set user, but there might be issues
          }
        } catch (error) {
          console.error("Error getting token on auth change:", error);

          // Set user anyway, but log the error
          setCurrentUser(user);

          // Try to recover
          setTimeout(async () => {
            if (auth.currentUser) {
              try {
                await auth.currentUser.getIdToken(true);
                console.log("Token recovery successful");
              } catch (recoveryError) {
                console.error("Token recovery failed:", recoveryError);
              }
            }
          }, 5000);
        }
      } else {
        console.log("No user, clearing state");
        setCurrentUser(null);
      }

      setLoading(false);
      setAuthChecked(true);
      console.log("=== AUTH STATE CHANGE COMPLETE ===");
    });

    return unsubscribe;
  }, []);

  // Helper function to ensure user has valid token
  const ensureValidToken = async () => {
    if (!currentUser) {
      throw new Error("No user logged in");
    }

    try {
      const token = await currentUser.getIdToken(true);
      if (!token || token.length < 500) {
        throw new Error("Invalid token received");
      }
      return token;
    } catch (error) {
      console.error("Error ensuring valid token:", error);
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
    ensureValidToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
