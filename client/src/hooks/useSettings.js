import { useState, useCallback } from 'react';

const STORAGE_KEY = 'work_dashboard_settings';

const defaults = {
  panels: [
    { id: 'news', visible: true, label: 'Poland in US Media' },
    { id: 'truth', visible: true, label: 'Truth Social' },
    { id: 'outlook', visible: true, label: 'Outlook Email' },
    { id: 'twitter', visible: true, label: 'Twitter / X' },
  ],
  refreshIntervals: {
    news: 300_000,    // 5 min
    truth: 120_000,   // 2 min
    outlook: 60_000,  // 1 min
    twitter: 0,       // embed, no polling
  },
  newsQuery: 'Poland',
  truthHandle: 'realDonaldTrump',
  twitterUsername: '',
  theme: 'dark',
  newsPageSize: 20,
  outlookFolder: 'inbox',
  outlookTop: 20,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw);
    return {
      ...defaults,
      ...saved,
      panels: saved.panels ?? defaults.panels,
      refreshIntervals: { ...defaults.refreshIntervals, ...saved.refreshIntervals },
    };
  } catch {
    return defaults;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(load);

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(defaults);
  }, []);

  return { settings, update, reset };
}
