const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
}));

app.use(express.json());

// ✅ Prefix routes to match API Gateway
app.use('/api/users', require('./routes/user.routes'));

app.get('/health', (_, res) => {
  res.json({ status: 'User Service running' });
});

module.exports = app;
