import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useAppSelector } from "@/hooks/redux";

export const TokenDebugger = () => {
  const [currentUserToken, setCurrentUserToken] = useState<string | null>(null);
  const [authState, setAuthState] = useState<string>("checking");
  const storedToken = useAppSelector(
    (state) => state.customerAuth?.firebaseToken
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setAuthState("authenticated");
        try {
          const token = await user.getIdToken();
          setCurrentUserToken(token.substring(0, 50) + "...");
        } catch (error) {
          console.error("Error getting token:", error);
          setCurrentUserToken("ERROR");
        }
      } else {
        setAuthState("not authenticated");
        setCurrentUserToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className='fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md z-50'>
      <h3 className='font-bold mb-2'>🔍 Token Debug</h3>
      <div className='space-y-1'>
        <p>
          <strong>Auth State:</strong> {authState}
        </p>
        <p>
          <strong>User UID:</strong> {auth.currentUser?.uid || "null"}
        </p>
        <p>
          <strong>Current User Token:</strong> {currentUserToken || "null"}
        </p>
        <p>
          <strong>Stored Token (Redux):</strong>{" "}
          {storedToken ? storedToken.substring(0, 50) + "..." : "null"}
        </p>
        <p>
          <strong>Tokens Match:</strong>{" "}
          {currentUserToken &&
          storedToken &&
          storedToken.startsWith(currentUserToken.slice(0, 20))
            ? "✅"
            : "❌"}
        </p>
      </div>
      <button
        onClick={async () => {
          if (auth.currentUser) {
            const fresh = await auth.currentUser.getIdToken(true);
            console.log("Fresh token:", fresh);
            alert("Check console for fresh token");
          }
        }}
        className='mt-2 bg-blue-600 px-2 py-1 rounded text-white'
      >
        Get Fresh Token
      </button>
    </div>
  );
};
