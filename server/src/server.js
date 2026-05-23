const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const app = require('./app');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Make socket.io instance accessible in Express request object
app.set('io', io);

// Bind Socket.io events
const socketHandler = require('./sockets/socketHandler');
socketHandler(io);

// Start Server
const startServer = async () => {
  // Connect to DB (MongoDB or simulated JSON fallback)
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Smart Grocery Sri Lanka Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
