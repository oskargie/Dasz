import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import NewsPanel from './components/NewsPanel.jsx';
import TruthPanel from './components/TruthPanel.jsx';
import OutlookPanel from './components/OutlookPanel.jsx';
import TwitterPanel from './components/TwitterPanel.jsx';
import Settings from './components/Settings.jsx';
import { useSettings } from './hooks/useSettings.js';
import './index.css';

const PANEL_COMPONENTS = {
  news: (s) => (
    <NewsPanel
      key="news"
      query={s.newsQuery}
      pageSize={s.newsPageSize}
      refreshInterval={s.refreshIntervals.news}
    />
  ),
  truth: (s) => (
    <TruthPanel
      key="truth"
      handle={s.truthHandle}
      refreshInterval={s.refreshIntervals.truth}
    />
  ),
  outlook: (s) => (
    <OutlookPanel
      key="outlook"
      folder={s.outlookFolder}
      top={s.outlookTop}
      refreshInterval={s.refreshIntervals.outlook}
    />
  ),
  twitter: (s) => (
    <TwitterPanel key="twitter" username={s.twitterUsername} />
  ),
};

export default function App() {
  const { settings, update, reset } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  const visiblePanels = settings.panels.filter((p) => p.visible);
  const gridCols = visiblePanels.length <= 2 ? visiblePanels.length : 2;

  return (
    <div className={`app theme-${settings.theme}`}>
      <header className="app-header">
        <div className="app-title">
          <span className="title-icon">📊</span>
          <h1>Work Dashboard</h1>
        </div>
        <button className="icon-btn settings-trigger" onClick={() => setShowSettings(true)} title="Settings">
          <SettingsIcon size={18} />
          <span>Settings</span>
        </button>
      </header>

      <main
        className="dashboard-grid"
        style={{ '--grid-cols': gridCols }}
      >
        {visiblePanels.map((panel) => PANEL_COMPONENTS[panel.id]?.(settings))}
      </main>

      {showSettings && (
        <Settings
          settings={settings}
          onUpdate={update}
          onReset={() => { reset(); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
