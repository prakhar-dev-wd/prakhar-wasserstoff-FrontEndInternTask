// App.tsx - Updated with error handling and fixes
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Editor from "./components/Editor.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { ConnectionStatus } from "./types.ts";

const App: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [socket, setSocket] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only attempt connection if username is set
    if (username) {
      setConnectionStatus(ConnectionStatus.CONNECTING);
      setError(null);
      
      try {
        const newSocket = io("http://localhost:5000", {
          reconnectionAttempts: 5,
          timeout: 10000,
        });

        // Socket connection handlers
        newSocket.on("connect", () => {
          console.log("Connected to server");
          setConnectionStatus(ConnectionStatus.CONNECTED);
          // Identify user to server
          newSocket.emit("userJoined", username);
        });

        newSocket.on("connect_error", (err) => {
          console.error("Connection error:", err);
          setError(`Connection error: ${err.message}`);
          setConnectionStatus(ConnectionStatus.ERROR);
        });

        newSocket.on("connect_timeout", () => {
          console.error("Connection timeout");
          setError("Connection timed out. Please try again.");
          setConnectionStatus(ConnectionStatus.ERROR);
        });

        newSocket.on("disconnect", (reason) => {
          console.log(`Disconnected: ${reason}`);
          if (reason === "io server disconnect") {
            setError("You were disconnected by the server.");
          } else if (reason === "transport close") {
            setError("Connection lost. Attempting to reconnect...");
          }
          setConnectionStatus(ConnectionStatus.DISCONNECTED);
        });

        newSocket.on("error", (err: any) => {
          console.error("Socket error:", err);
          setError(`Socket error: ${err.message || "Unknown error"}`);
          setConnectionStatus(ConnectionStatus.ERROR);
        });

        setSocket(newSocket);

        return () => {
          newSocket.disconnect();
        };
      } catch (err: any) {
        console.error("Failed to create socket:", err);
        setError(`Failed to connect: ${err.message}`);
        setConnectionStatus(ConnectionStatus.ERROR);
      }
    }
  }, [username]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setUsername(inputValue.trim());
    }
  };

  // Render the appropriate UI based on connection status
  const renderContent = () => {
    if (!username) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Join Collaborative Editor</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter username"
              className="border p-2 mb-4 w-full rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded w-full"
            >
              Join
            </button>
          </form>
        </div>
      );
    }

    switch (connectionStatus) {
      case ConnectionStatus.CONNECTING:
        return (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Connecting to server...</p>
          </div>
        );
      case ConnectionStatus.CONNECTED:
        return socket && <Editor socket={socket} username={username} />;
      case ConnectionStatus.ERROR:
      case ConnectionStatus.DISCONNECTED:
        return (
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
            <div className="text-red-500 mb-4">
              {error || "Disconnected from server"}
            </div>
            <button
              onClick={() => setUsername("")}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
            >
              Return to Login
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <ErrorBoundary>
        {renderContent()}
      </ErrorBoundary>
    </div>
  );
};

export default App;