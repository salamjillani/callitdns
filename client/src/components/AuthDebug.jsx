import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
// import { auth } from '..services/firebase';

export default function AuthDebug() {
  const { currentUser } = useAuth();
  const [tokenInfo, setTokenInfo] = useState("");

  const checkToken = async () => {
    if (!currentUser) {
      setTokenInfo("No user logged in");
      return;
    }

    try {
      const token = await currentUser.getIdToken(true);
      const tokenResult = await currentUser.getIdTokenResult(true);

      setTokenInfo(`
Token Length: ${token.length}
Token Expires: ${new Date(tokenResult.expirationTime).toISOString()}
Auth Time: ${new Date(tokenResult.authTime).toISOString()}
User UID: ${currentUser.uid}
User Email: ${currentUser.email}
Claims: ${JSON.stringify(tokenResult.claims, null, 2)}
      `);
    } catch (error) {
      setTokenInfo(`Token Error: ${error.message}`);
    }
  };

  if (import.meta.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-md">
      <h3 className="text-white font-semibold mb-2">Auth Debug</h3>
      <button
        onClick={checkToken}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mb-2"
      >
        Check Token
      </button>
      {tokenInfo && (
        <pre className="text-xs text-slate-300 overflow-auto max-h-40">
          {tokenInfo}
        </pre>
      )}
    </div>
  );
}
