import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import Panel from './Panel.jsx';
import { useAutoRefresh } from '../hooks/useAutoRefresh.js';

export default function TruthPanel({ handle, refreshInterval }) {
  const [posts, setPosts] = useState([]);
  const [feedTitle, setFeedTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/truth?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch feed');
      setFeedTitle(data.title || '');
      setPosts(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [handle]);

  useEffect(() => { fetch_(); }, [fetch_]);
  const refresh = useAutoRefresh(fetch_, refreshInterval);

  return (
    <Panel
      id="truth"
      title={feedTitle || 'Truth Social'}
      icon={<MessageSquare size={14} />}
      loading={loading}
      error={error}
      onRefresh={refresh}
    >
      <ul className="post-list">
        {posts.map((p) => (
          <li key={p.id} className="post-item">
            <p className="post-content">{p.content}</p>
            <div className="post-meta">
              {p.pubDate && (
                <span className="post-time">
                  {formatDistanceToNow(new Date(p.pubDate), { addSuffix: true })}
                </span>
              )}
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer" className="post-link">
                  View
                </a>
              )}
            </div>
          </li>
        ))}
        {posts.length === 0 && <li className="empty-state">No posts found.</li>}
      </ul>
    </Panel>
  );
}
