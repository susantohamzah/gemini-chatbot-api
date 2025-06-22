import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_PATH = 'public';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
   
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: 'Message is required' });
    }

    try {
      const result = await genAI.models.generateContent({
        model : 'gemini-2.0-flash',
        contents : message,
    });
    const text = result.text;
    return res.status(200).json({ reply: text });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ reply: 'Something Went Wrong' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


