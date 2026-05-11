import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Newspaper } from 'lucide-react';
import Panel from './Panel.jsx';
import { useAutoRefresh } from '../hooks/useAutoRefresh.js';

export default function NewsPanel({ query, pageSize, refreshInterval }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?query=${encodeURIComponent(query)}&pageSize=${pageSize}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch news');
      setArticles(data.articles || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [query, pageSize]);

  useEffect(() => { fetch_(); }, [fetch_]);
  const refresh = useAutoRefresh(fetch_, refreshInterval);

  return (
    <Panel
      id="news"
      title="Poland in US Media"
      icon={<Newspaper size={14} />}
      loading={loading}
      error={error}
      onRefresh={refresh}
    >
      <ul className="article-list">
        {articles.map((a) => (
          <li key={a.url} className="article-item">
            <a href={a.url} target="_blank" rel="noreferrer" className="article-title">
              {a.title}
            </a>
            <div className="article-meta">
              <span className="source-badge">{a.source?.name}</span>
              {a.publishedAt && (
                <span className="article-time">
                  {formatDistanceToNow(new Date(a.publishedAt), { addSuffix: true })}
                </span>
              )}
            </div>
            {a.description && <p className="article-desc">{a.description}</p>}
          </li>
        ))}
        {articles.length === 0 && <li className="empty-state">No articles found.</li>}
      </ul>
    </Panel>
  );
}
