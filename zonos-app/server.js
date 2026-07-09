import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { fal } from '@fal-ai/client';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.FAL_KEY) {
  console.warn('Warning: FAL_KEY is not set. Requests to /api/generate will fail until you set it in .env');
}

fal.config({ credentials: process.env.FAL_KEY });

const app = express();
const upload = multer({ limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB reference clip cap

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/generate', upload.single('reference'), async (req, res) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ error: 'Missing "text" to speak.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Missing reference voice clip.' });
    }

    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/wav' });
    const referenceAudioUrl = await fal.storage.upload(blob);

    const result = await fal.subscribe('fal-ai/zonos', {
      input: {
        reference_audio_url: referenceAudioUrl,
        prompt: text,
      },
      logs: false,
    });

    const audioUrl = result?.data?.audio?.url || result?.data?.audio_url || result?.data?.audio;
    if (!audioUrl) {
      console.error('Unexpected Zonos response shape:', JSON.stringify(result?.data));
      return res.status(502).json({ error: 'Zonos returned an unexpected response.' });
    }

    res.json({ audioUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Generation failed.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Zonos app listening on http://localhost:${PORT}`);
});
