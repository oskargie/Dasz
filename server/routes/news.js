import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.get('/', async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'NEWS_API_KEY not configured' });
  }

  const {
    query = 'Poland',
    country = 'us',
    pageSize = 20,
    page = 1,
    sortBy = 'publishedAt',
  } = req.query;

  try {
    const { data } = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sources: 'the-wall-street-journal,the-new-york-times,abc-news,cbs-news,nbc-news,politico,the-washington-post,usa-today,reuters,associated-press,bloomberg',
        sortBy,
        pageSize: Math.min(Number(pageSize), 50),
        page,
      },
      headers: { 'X-Api-Key': apiKey },
    });
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || err.message;
    res.status(status).json({ error: message });
  }
});

export default router;
