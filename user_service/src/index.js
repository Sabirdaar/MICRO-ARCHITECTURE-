const express = require('express');
const cors = require('cors');
require('dotenv').config();
// Initialize Firebase via module
require('./firebase');

const { userRoutes } = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://frontend:5173',
    'http://api-gateway:5000',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'User Service is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`User Service running on port ${PORT}`);
});