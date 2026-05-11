import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Mail, LogIn, LogOut } from 'lucide-react';
import Panel from './Panel.jsx';
import { useAutoRefresh } from '../hooks/useAutoRefresh.js';

export default function OutlookPanel({ folder, top, refreshInterval }) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/outlook/status');
      const data = await res.json();
      setConnected(data.connected);
      setConfigured(data.configured);
    } catch {
      setConfigured(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/outlook/messages?folder=${folder}&top=${top}`);
      const data = await res.json();
      if (res.status === 401) {
        setConnected(false);
        return;
      }
      if (!res.ok) throw new Error(data.error?.message || data.error || 'Failed to fetch emails');
      setMessages(data.messages || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [folder, top]);

  useEffect(() => {
    checkStatus().then(() => {});
    // Check if redirected back from OAuth
    if (window.location.search.includes('outlook=connected')) {
      setConnected(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkStatus]);

  useEffect(() => {
    if (connected) fetchMessages();
    else setLoading(false);
  }, [connected, fetchMessages]);

  const refresh = useAutoRefresh(fetchMessages, refreshInterval, connected);

  const handleConnect = () => {
    window.location.href = '/api/outlook/auth';
  };

  const handleDisconnect = async () => {
    await fetch('/api/outlook/disconnect', { method: 'POST' });
    setConnected(false);
    setMessages([]);
  };

  const headerExtra = configured ? (
    connected ? (
      <button className="icon-btn" onClick={handleDisconnect} title="Disconnect Outlook">
        <LogOut size={14} />
      </button>
    ) : (
      <button className="connect-btn" onClick={handleConnect}>
        <LogIn size={12} /> Connect
      </button>
    )
  ) : null;

  return (
    <Panel
      id="outlook"
      title="Outlook Email"
      icon={<Mail size={14} />}
      loading={loading && connected}
      error={error}
      onRefresh={connected ? refresh : undefined}
      headerExtra={headerExtra}
    >
      {!configured && (
        <div className="setup-prompt">
          <p>Configure <code>OUTLOOK_CLIENT_ID</code> and <code>OUTLOOK_CLIENT_SECRET</code> in <code>server/.env</code> to enable Outlook.</p>
          <a href="https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app" target="_blank" rel="noreferrer">
            Azure App Registration guide →
          </a>
        </div>
      )}
      {configured && !connected && (
        <div className="setup-prompt">
          <p>Connect your Outlook account to see emails.</p>
          <button className="connect-btn-lg" onClick={handleConnect}>
            <LogIn size={16} /> Sign in with Microsoft
          </button>
        </div>
      )}
      {connected && (
        <ul className="message-list">
          {messages.map((m) => (
            <li key={m.id} className={`message-item${m.isRead ? '' : ' unread'}`}>
              <a href={m.webLink} target="_blank" rel="noreferrer" className="message-subject">
                {m.subject || '(no subject)'}
              </a>
              <div className="message-meta">
                <span className="message-from">{m.from?.emailAddress?.name || m.from?.emailAddress?.address}</span>
                {m.receivedDateTime && (
                  <span className="message-time">
                    {formatDistanceToNow(new Date(m.receivedDateTime), { addSuffix: true })}
                  </span>
                )}
              </div>
              {m.bodyPreview && <p className="message-preview">{m.bodyPreview}</p>}
            </li>
          ))}
          {messages.length === 0 && <li className="empty-state">Inbox is empty.</li>}
        </ul>
      )}
    </Panel>
  );
}
