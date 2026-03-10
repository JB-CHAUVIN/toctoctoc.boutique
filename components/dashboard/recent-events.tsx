"use client";

import { useState } from "react";
import { IpClickable } from "./ip-clickable";

interface LogEntry {
  id: string;
  action: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

interface RecentEventsProps {
  logs: LogEntry[];
  actionIcons: Record<string, string>;
  excludedIps: string[];
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function RecentEvents({ logs, actionIcons, excludedIps }: RecentEventsProps) {
  const [frOnly, setFrOnly] = useState(true);

  const filtered = frOnly
    ? logs.filter((log) => {
        const country = log.meta?.country as string | undefined;
        return country?.toUpperCase() === "FR";
      })
    : logs;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Derniers événements</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={frOnly}
            onChange={(e) => setFrOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          🇫🇷 France uniquement
        </label>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">Aucun événement{frOnly ? " depuis la France" : ""} enregistré.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const meta = log.meta;
            const icon = actionIcons[log.action] ?? "📋";
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                <span className="mt-0.5 text-base">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-slate-700">
                      {log.action}
                    </span>
                    {meta?.country ? (
                      <span className="text-xs text-slate-400">
                        {String(meta.country).toUpperCase()}
                      </span>
                    ) : null}
                    <span className="text-xs text-slate-400">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  {meta && (
                    <div className="mt-0.5 truncate text-xs text-slate-500">
                      {Object.entries(meta)
                        .filter(([k]) => k !== "businessId" && k !== "country")
                        .map(([k, v]) => {
                          const strVal = String(v);
                          const isIp = k === "ip" || /^(\d{1,3}\.){3}\d{1,3}$/.test(strVal);
                          if (isIp) {
                            return (
                              <span key={k}>
                                {k}:{" "}
                                <IpClickable ip={strVal} excludedIps={excludedIps} />
                              </span>
                            );
                          }
                          return <span key={k}>{k}: {strVal}</span>;
                        })
                        .reduce<React.ReactNode[]>((acc, el, i) => {
                          if (i > 0) acc.push(<span key={`sep-${i}`}> · </span>);
                          acc.push(el);
                          return acc;
                        }, [])}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
