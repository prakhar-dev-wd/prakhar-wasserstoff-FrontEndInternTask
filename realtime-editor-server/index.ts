import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend domain
    methods: ["GET", "POST"]
  }
});

interface Change {
  username: string;
  timestamp: number;
}

let content = ""; // Shared content for all users
let lastEditor: Change | null = null;
const activeUsers = new Set<string>();

// Socket error handler
const handleSocketError = (socket: any, error: Error) => {
  console.error("Socket error:", error);
  socket.emit("editorError", "An error occurred: " + error.message);
};

// When a user connects
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  let currentUser = "";

  try {
    // User joined the editor
    socket.on("userJoined", (username: string) => {
      try {
        if (!username) {
          socket.emit("editorError", "Username is required");
          return;
        }

        currentUser = username;
        activeUsers.add(username);
        
        // Send initial content to the user
        socket.emit("initialContent", { content, lastEditor });
        
        // Broadcast updated user list
        io.emit("userList", Array.from(activeUsers));
        
        console.log(`User joined: ${username}, Total users: ${activeUsers.size}`);
      } catch (error: any) {
        handleSocketError(socket, error);
      }
    });

    // Listen for content changes from a user
    socket.on("contentChanged", (newContent: string, username: string) => {
      try {
        if (!username) {
          socket.emit("editorError", "User information missing");
          return;
        }

        content = newContent; // Update the shared content
        
        // Record who made the change
        lastEditor = {
          username,
          timestamp: Date.now()
        };
        
        // Broadcast to all users except sender
        socket.broadcast.emit("updateContent", content, lastEditor);
        console.log(`${username} made a change`);
      } catch (error: any) {
        handleSocketError(socket, error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      if (currentUser) {
        activeUsers.delete(currentUser);
        io.emit("userList", Array.from(activeUsers));
        console.log(`User disconnected: ${currentUser}, Total users: ${activeUsers.size}`);
      } else {
        console.log("Unknown user disconnected");
      }
    });
  } catch (error: any) {
    console.error("Unhandled socket error:", error);
  }
});

// Basic error handling for Express
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send('Something broke on the server!');
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, you might want to notify admins and gracefully restart
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});