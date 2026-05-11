import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import newsRouter from './routes/news.js';
import truthRouter from './routes/truth.js';
import outlookRouter from './routes/outlook.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/news', newsRouter);
app.use('/api/truth', truthRouter);
app.use('/api/outlook', outlookRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
