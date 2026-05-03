import React, { useState, useEffect, useRef, useCallback } from 'react';
import { dashboardAPI, portsAPI } from '../services/api';
import { useAlertPrefs } from '../contexts/AlertPrefsContext';

interface CriticalAlert {
  event_id: string;
  timestamp: string;
  attack_type: string;
  src_ip: string | null;
  severity: string;
  ml: boolean | null;
  dl: boolean | null;
}

type IsolateState = 'idle' | 'loading' | 'success' | 'not_found' | 'already_isolated' | 'error';

const SEEN_KEY = 'safenode_seen_critical_ids';
const POLL_INTERVAL_MS = 10_000;

// Restore previously seen alert IDs from localStorage to survive page reloads
function loadSeenIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

// Append a new seen ID and cap the stored list to the latest 500 entries
function persistSeenId(id: string) {
  const ids = loadSeenIds();
  ids.add(id);
  const arr = Array.from(ids).slice(-500);
  localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
}

export const CriticalAlertNotifier: React.FC = () => {
  const { criticalAlertsEnabled } = useAlertPrefs();
  const [queue, setQueue] = useState<CriticalAlert[]>([]);
  const [isolateState, setIsolateState] = useState<Record<string, IsolateState>>({});
  const seenRef = useRef<Set<string>>(loadSeenIds());
  const initialLoadDone = useRef(false);

  // Poll the API every 10 s and surface only alerts not previously seen
  const poll = useCallback(async () => {
    try {
      const res = await dashboardAPI.getAlerts(20, 0);
      const criticals: CriticalAlert[] = (res.data as CriticalAlert[]).filter(
        (a) => a.severity === 'critical'
      );

      if (!initialLoadDone.current) {
        // Silently mark existing criticals as seen so page-load doesn't flood notifications
        criticals.forEach((a) => {
          seenRef.current.add(a.event_id);
          persistSeenId(a.event_id);
        });
        initialLoadDone.current = true;
        return;
      }

      const fresh = criticals.filter((a) => !seenRef.current.has(a.event_id));
      if (fresh.length === 0) return;

      fresh.forEach((a) => {
        seenRef.current.add(a.event_id);
        persistSeenId(a.event_id);
      });
      setQueue((prev) => [...fresh, ...prev].slice(0, 5));
    } catch {
      // silently ignore — don't disrupt the user with fetch errors
    }
  }, []);

  useEffect(() => {
    poll();
    const timer = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [poll]);

  // Remove a notification from the visible queue and clear its isolate state
  const dismiss = (id: string) => {
    setQueue((prev) => prev.filter((n) => n.event_id !== id));
    setIsolateState((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Resolve the alert's source IP to a switch port and trigger isolation via the API
  const handleIsolate = async (alert: CriticalAlert) => {
    setIsolateState((prev) => ({ ...prev, [alert.event_id]: 'loading' }));
    try {
      const portsRes = await portsAPI.getAllPorts();
      const ports: { port_id: string; device_ip: string | null; status: string }[] = portsRes.data;

      const match = ports.find((p) => p.device_ip === alert.src_ip);
      if (!match) {
        setIsolateState((prev) => ({ ...prev, [alert.event_id]: 'not_found' }));
        return;
      }
      if (match.status === 'isolated') {
        setIsolateState((prev) => ({ ...prev, [alert.event_id]: 'already_isolated' }));
        return;
      }

      await portsAPI.isolatePort(match.port_id, {
        reason: `Critical ${alert.attack_type} attack detected from ${alert.src_ip}`,
        isolated_by: 'alert_auto',
      });

      setIsolateState((prev) => ({ ...prev, [alert.event_id]: 'success' }));
      setTimeout(() => dismiss(alert.event_id), 2500);
    } catch {
      setIsolateState((prev) => ({ ...prev, [alert.event_id]: 'error' }));
    }
  };

  if (!criticalAlertsEnabled || queue.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3" style={{ maxWidth: '22rem', width: '100%' }}>
      {queue.map((alert) => {
        const state: IsolateState = isolateState[alert.event_id] ?? 'idle';
        return (
          <div
            key={alert.event_id}
            className="alert-toast-enter bg-gray-900 border-2 border-red-500 rounded-xl overflow-hidden shadow-2xl"
            style={{ boxShadow: '0 0 30px rgba(239,68,68,0.25)' }}
          >
            {/* Header bar */}
            <div className="bg-red-600 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span className="text-white text-xs font-bold uppercase tracking-widest">
                  Critical Threat
                </span>
              </div>
              <button
                onClick={() => dismiss(alert.event_id)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* Attack info row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white font-bold text-base leading-tight">
                    {alert.attack_type} Attack
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {alert.ml && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/50 text-green-400 border border-green-700 font-semibold">
                      ML
                    </span>
                  )}
                  {alert.dl && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700 font-semibold">
                      DL
                    </span>
                  )}
                </div>
              </div>

              {/* Source IP */}
              {alert.src_ip && (
                <div className="bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-gray-500 text-xs">Attack Source</p>
                  <p className="font-mono text-red-400 font-semibold text-sm mt-0.5">
                    {alert.src_ip}
                  </p>
                </div>
              )}

              {/* Action area */}
              {state === 'success' ? (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Port isolated successfully
                </div>
              ) : state === 'already_isolated' ? (
                <p className="text-yellow-400 text-xs">
                  Port is already isolated.
                </p>
              ) : state === 'not_found' ? (
                <p className="text-yellow-400 text-xs">
                  No switch port matched this IP. Isolate manually via the Ports page.
                </p>
              ) : state === 'error' ? (
                <p className="text-red-400 text-xs">
                  Isolation failed — check the Ports page to isolate manually.
                </p>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleIsolate(alert)}
                    disabled={state === 'loading'}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {state === 'loading' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Isolating...
                      </span>
                    ) : (
                      'Isolate Port'
                    )}
                  </button>
                  <button
                    onClick={() => dismiss(alert.event_id)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
