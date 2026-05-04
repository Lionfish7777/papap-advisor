const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!voiceId || !apiKey) {
      return res.status(503).json({ error: 'Voice service not configured' });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg'
        },
        responseType: 'stream'
      }
    );

    res.set('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (error) {
    console.error('ElevenLabs error:', error.message);
    res.status(500).json({ error: 'Failed to generate voice' });
  }
});

module.exports = router;
