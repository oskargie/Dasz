import { Router } from 'express';
import Parser from 'rss-parser';

const router = Router();
const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent', { keepArray: false }]],
  },
});

router.get('/', async (req, res) => {
  const handle = req.query.handle || 'realDonaldTrump';
  const feedUrl = `https://truthsocial.com/@${handle}.rss`;

  try {
    const feed = await parser.parseURL(feedUrl);
    const items = feed.items.slice(0, 30).map((item) => ({
      id: item.guid || item.link,
      title: item.title,
      content: item.contentSnippet || item.content,
      link: item.link,
      pubDate: item.pubDate || item.isoDate,
      author: item.creator || feed.title,
    }));
    res.json({ title: feed.title, items });
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch Truth Social feed: ${err.message}` });
  }
});

export default router;
