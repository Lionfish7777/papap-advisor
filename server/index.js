require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRouter = require('./routes/chat');
const voiceRouter = require('./routes/voice');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173']
}));
app.use(express.json({ limit: '50mb' }));

app.use('/api/chat', chatRouter);
app.use('/api/voice', voiceRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Papap is live on port ${PORT}`);
});
