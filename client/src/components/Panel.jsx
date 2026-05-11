import { RefreshCw, AlertCircle } from 'lucide-react';

export default function Panel({ id, title, icon, loading, error, onRefresh, children, headerExtra }) {
  return (
    <div className="panel" data-panel-id={id}>
      <div className="panel-header">
        <div className="panel-title">
          {icon && <span className="panel-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="panel-actions">
          {headerExtra}
          {onRefresh && (
            <button
              className={`icon-btn${loading ? ' spin' : ''}`}
              onClick={onRefresh}
              title="Refresh"
              disabled={loading}
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="panel-body">
        {error && (
          <div className="panel-error">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        {loading && !error && <div className="panel-loading"><span className="spinner" /></div>}
        {!loading && !error && children}
      </div>
    </div>
  );
}
