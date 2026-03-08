const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/student', require('./src/routes/studentRoutes'));
app.use('/api/resources', require('./src/routes/resourceRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
