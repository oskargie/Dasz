import { useState } from 'react';
import { X, GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';

const INTERVAL_OPTIONS = [
  { label: '30 s', value: 30_000 },
  { label: '1 min', value: 60_000 },
  { label: '2 min', value: 120_000 },
  { label: '5 min', value: 300_000 },
  { label: '10 min', value: 600_000 },
  { label: 'Off', value: 0 },
];

export default function Settings({ settings, onUpdate, onReset, onClose }) {
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const updateInterval = (id, value) => {
    onUpdate((s) => ({
      ...s,
      refreshIntervals: { ...s.refreshIntervals, [id]: Number(value) },
    }));
  };

  const toggleVisible = (id) => {
    onUpdate((s) => ({
      ...s,
      panels: s.panels.map((p) => p.id === id ? { ...p, visible: !p.visible } : p),
    }));
  };

  const handleDragStart = (e, index) => {
    setDragging(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragging === null || dragging === dropIndex) return;
    onUpdate((s) => {
      const panels = [...s.panels];
      const [moved] = panels.splice(dragging, 1);
      panels.splice(dropIndex, 0, moved);
      return { ...s, panels };
    });
    setDragging(null);
    setDragOver(null);
  };

  return (
    <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Dashboard Settings</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="settings-body">
          {/* Panel order & visibility */}
          <section className="settings-section">
            <h3>Panels — order &amp; visibility</h3>
            <p className="muted">Drag to reorder. Click the eye to hide/show.</p>
            <ul className="panel-order-list">
              {settings.panels.map((panel, i) => (
                <li
                  key={panel.id}
                  className={`panel-order-item${dragOver === i ? ' drag-over' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={(e) => handleDrop(e, i)}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                >
                  <GripVertical size={14} className="drag-handle" />
                  <span className="panel-label">{panel.label}</span>
                  <button className="icon-btn" onClick={() => toggleVisible(panel.id)} title="Toggle visibility">
                    {panel.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Refresh intervals */}
          <section className="settings-section">
            <h3>Auto-refresh intervals</h3>
            {settings.panels.filter((p) => p.id !== 'twitter').map((panel) => (
              <div key={panel.id} className="settings-row">
                <label>{panel.label}</label>
                <select
                  value={settings.refreshIntervals[panel.id] ?? 0}
                  onChange={(e) => updateInterval(panel.id, e.target.value)}
                >
                  {INTERVAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </section>

          {/* News settings */}
          <section className="settings-section">
            <h3>News panel</h3>
            <div className="settings-row">
              <label>Search query</label>
              <input
                type="text"
                value={settings.newsQuery}
                onChange={(e) => onUpdate({ newsQuery: e.target.value })}
                placeholder="e.g. Poland"
              />
            </div>
            <div className="settings-row">
              <label>Articles per load</label>
              <select
                value={settings.newsPageSize}
                onChange={(e) => onUpdate({ newsPageSize: Number(e.target.value) })}
              >
                {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </section>

          {/* Truth Social settings */}
          <section className="settings-section">
            <h3>Truth Social panel</h3>
            <div className="settings-row">
              <label>Account handle</label>
              <input
                type="text"
                value={settings.truthHandle}
                onChange={(e) => onUpdate({ truthHandle: e.target.value })}
                placeholder="e.g. realDonaldTrump"
              />
            </div>
          </section>

          {/* Outlook settings */}
          <section className="settings-section">
            <h3>Outlook panel</h3>
            <div className="settings-row">
              <label>Folder</label>
              <select
                value={settings.outlookFolder}
                onChange={(e) => onUpdate({ outlookFolder: e.target.value })}
              >
                <option value="inbox">Inbox</option>
                <option value="sentitems">Sent Items</option>
                <option value="drafts">Drafts</option>
                <option value="deleteditems">Deleted Items</option>
              </select>
            </div>
            <div className="settings-row">
              <label>Messages per load</label>
              <select
                value={settings.outlookTop}
                onChange={(e) => onUpdate({ outlookTop: Number(e.target.value) })}
              >
                {[10, 20, 30, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </section>

          {/* Twitter settings */}
          <section className="settings-section">
            <h3>Twitter / X panel</h3>
            <div className="settings-row">
              <label>Your @username</label>
              <input
                type="text"
                value={settings.twitterUsername}
                onChange={(e) => onUpdate({ twitterUsername: e.target.value.replace('@', '') })}
                placeholder="username (without @)"
              />
            </div>
            <p className="muted">Uses your browser's logged-in session. Make sure you're signed in to X.</p>
          </section>

          <div className="settings-footer">
            <button className="danger-btn" onClick={onReset}>
              <RotateCcw size={14} /> Reset all settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
