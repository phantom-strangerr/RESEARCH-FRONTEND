import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'safenode_critical_alerts_enabled';

interface AlertPrefsContextValue {
  criticalAlertsEnabled: boolean;
  toggleCriticalAlerts: () => void;
}

const AlertPrefsContext = createContext<AlertPrefsContextValue>({
  criticalAlertsEnabled: true,
  toggleCriticalAlerts: () => {},
});

export const AlertPrefsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialise from localStorage so the user's preference survives a refresh
  const [criticalAlertsEnabled, setCriticalAlertsEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });

  // Flip the preference and persist the new value immediately
  const toggleCriticalAlerts = () => {
    setCriticalAlertsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <AlertPrefsContext.Provider value={{ criticalAlertsEnabled, toggleCriticalAlerts }}>
      {children}
    </AlertPrefsContext.Provider>
  );
};

export const useAlertPrefs = () => useContext(AlertPrefsContext);
