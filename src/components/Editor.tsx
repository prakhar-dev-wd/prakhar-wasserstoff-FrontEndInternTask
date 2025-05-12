import React, { useEffect, useRef, useState, useCallback } from "react";
import { Change } from "../types";

interface EditorProps {
  socket: any;
  username: string;
}

const Editor: React.FC<EditorProps> = ({ socket, username }) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState<string>("");
  const [lastEditor, setLastEditor] = useState<Change | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Debounce function to prevent too many socket emissions
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Setup socket listeners
  useEffect(() => {
    if (!socket) return;

    // Initial content load
    socket.on("initialContent", (initialData: { content: string, lastEditor: Change | null }) => {
      console.log("Received initial content", initialData);
      setContent(initialData.content);
      setLastEditor(initialData.lastEditor);
      
      // Safe update of editor content
      if (editorRef.current && initialData.content) {
        editorRef.current.innerHTML = initialData.content;
      }
    });

    // Listen for content updates from other users
    socket.on("updateContent", (newContent: string, change: Change) => {
      console.log(`Content updated by ${change.username}`);
      setContent(newContent);
      setLastEditor(change);
      
      // Only update the editor if it's not focused (to prevent cursor jumping)
      if (editorRef.current && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = newContent;
      }
    });

    // User list updates
    socket.on("userList", (userList: string[]) => {
      setUsers(userList);
    });

    // Error handling
    socket.on("editorError", (errorMsg: string) => {
      console.error("Editor error:", errorMsg);
      setError(errorMsg);
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    });

    // Clean up listeners
    return () => {
      socket.off("initialContent");
      socket.off("updateContent");
      socket.off("userList");
      socket.off("editorError");
    };
  }, [socket]);

  // Handle content changes
  const handleContentChange = useCallback(
    debounce(() => {
      if (editorRef.current && socket) {
        try {
          const updatedContent = editorRef.current.innerHTML;
          socket.emit("contentChanged", updatedContent, username);
        } catch (err: any) {
          console.error("Error sending content update:", err);
          setError(`Failed to send update: ${err.message}`);
        }
      }
    }, 300),
    [socket, username]
  );

  return (
    <div className="editor-container max-w-4xl w-full mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Collaborative Editor</h2>
          <p className="text-sm text-gray-600">
            Logged in as <span className="font-semibold">{username}</span>
          </p>
        </div>
        <div className="text-sm">
          {users.length > 0 && (
            <div className="text-gray-600">
              {users.length} user{users.length !== 1 ? "s" : ""} online
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4 bg-white shadow-sm rounded-lg">
        <div
          ref={editorRef}
          contentEditable
          className="border border-gray-300 p-4 w-full h-80 overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {lastEditor && (
        <div className="text-sm text-gray-600">
          Last edited by{" "}
          <span className="font-semibold">{lastEditor.username}</span> at{" "}
          {new Date(lastEditor.timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default Editor;