import { useEffect, useRef } from 'react';
import { Twitter } from 'lucide-react';
import Panel from './Panel.jsx';

export default function TwitterPanel({ username }) {
  const containerRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (!username || !containerRef.current) return;

    // Remove previous widget
    if (widgetRef.current) {
      widgetRef.current.remove();
      widgetRef.current = null;
    }

    const anchor = document.createElement('a');
    anchor.className = 'twitter-timeline';
    anchor.setAttribute('data-theme', 'dark');
    anchor.setAttribute('data-height', '100%');
    anchor.setAttribute('data-chrome', 'noheader nofooter noborders transparent');
    anchor.setAttribute('href', `https://twitter.com/${username}`);
    anchor.textContent = `Tweets by @${username}`;
    containerRef.current.appendChild(anchor);
    widgetRef.current = anchor;

    if (window.twttr?.widgets) {
      window.twttr.widgets.load(containerRef.current);
    } else {
      const script = document.getElementById('twitter-widget-script');
      if (!script) {
        const s = document.createElement('script');
        s.id = 'twitter-widget-script';
        s.src = 'https://platform.twitter.com/widgets.js';
        s.async = true;
        document.body.appendChild(s);
      } else {
        window.twttr?.widgets?.load(containerRef.current);
      }
    }

    return () => {
      anchor.remove();
      widgetRef.current = null;
    };
  }, [username]);

  return (
    <Panel id="twitter" title="Twitter / X" icon={<Twitter size={14} />}>
      {!username ? (
        <div className="setup-prompt">
          <p>Set your Twitter/X username in <strong>Settings</strong> to load your timeline.</p>
          <p className="muted">The embedded timeline uses your browser's logged-in X session — no API key needed.</p>
        </div>
      ) : (
        <div ref={containerRef} className="twitter-container" />
      )}
    </Panel>
  );
}
