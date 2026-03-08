const express = require('express');
const authRoutes = require('./src/routes/authRoutes');
const app = express();
app.use('/auth', authRoutes);
app.get('/', (req, res) => res.send('Hello'));
app.listen(5003, () => console.log('Min server on 5003'));
