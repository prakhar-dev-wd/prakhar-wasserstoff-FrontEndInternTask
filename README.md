# Real-Time Collaborative Editor

A browser-based collaborative text editor that allows multiple users to edit a document simultaneously in real-time. Changes made by one user are instantly visible to all other connected users.

## Features

- **Real-Time Collaboration**: Edit documents simultaneously with multiple users
- **User Attribution**: See who made the most recent changes
- **User Presence**: View who is currently online in the editor
- **Error Handling**: Robust error management for network issues and unexpected errors
- **Responsive Design**: Works well on various screen sizes

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Real-Time Communication**: Socket.IO
- **Backend**: Node.js with Express

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/yourusername/collaborative-editor.git
cd collaborative-editor
```

2. Install dependencies for both client and server
```bash
# Install client dependencies in the root directory
npm install

# Navigate to server directory
cd realtime-editor-server
npm install
```

### Running the Application

1. Start the server
```bash
# In the realtime-editor-server directory
npm install ts-node typescript @types/node --save-dev
node --loader ts-node/esm index.ts
# Or if using ts-node
ts-node index.ts
```

2. In a separate terminal, start the client
```bash
# In the root project directory
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## How to Use

1. Enter your username on the login screen
2. Start editing in the document area
3. See real-time updates from other connected users
4. View who is currently online and who made the last edit

## Project Structure

```
project-root/
├── node_modules/         # Node.js dependencies
├── public/               # Static assets
├── realtime-editor-server/  # Server-side code
│   ├── node_modules/     # Server dependencies
│   ├── index.ts          # Socket.IO server implementation
│   ├── package-lock.json # Server dependency lock file
│   ├── package.json      # Server package configuration
│   └── tsconfig.json     # TypeScript configuration for server
└── src/                  # Client-side code
    ├── components/       # React components
    │   ├── Editor.tsx    # Main editor component
    │   ├── ErrorBoundary.tsx  # Error handling component
    │   └── App.tsx       # Main application component
    ├── index.css         # Global styles (Tailwind)
    ├── index.html        # HTML entry point
    ├── index.tsx         # Application entry point
    ├── types.ts          # TypeScript type definitions
    ├── .gitignore        # Git ignore file
    ├── package-lock.json # Client dependency lock file
    ├── package.json      # Client package configuration
    ├── README.md         # Project documentation
    └── tailwind.config.js # Tailwind CSS configuration
```

## Error Handling

The application includes comprehensive error handling for various scenarios:

- Socket connection errors
- Server disconnections
- Runtime errors in React components
- Content synchronization issues

## Future Improvements

- User authentication and authorization
- Document persistence with database storage
- Multiple document support
- Rich text formatting
- Cursor presence to see where others are editing
- Offline mode with synchronization when reconnected

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Socket.IO](https://socket.io/) for real-time bidirectional event-based communication
- [React](https://reactjs.org/) for the UI library
- [Tailwind CSS](https://tailwindcss.com/) for styling
