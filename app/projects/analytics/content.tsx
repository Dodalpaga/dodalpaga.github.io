'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AnalyticsStats {
  total_page_views: number;
  unique_visitors: number;
  unique_ips: number;
  pages: Record<string, number>;
  hourly_stats: Record<string, number>;
  countries: Record<string, number>;
  cities: Record<string, number>;
  period_days: number;
}

const ink = 'var(--foreground)';
const muted = 'var(--foreground-muted)';
const line = 'var(--card-border)';
const accent = '#7698ff';

function formatPath(path: string) {
  return path === '/' ? 'Home' : path.replace(/\/$/, '').replace(/^\//, '').replace(/\//g, ' / ');
}

function rank(record: Record<string, number> | undefined, limit = 5) {
  return Object.entries(record || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function ListPanel({ title, rows }: {
  title: string;
  rows: { name: string; value: number }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className="analytics-panel analytics-list-panel">
      <div className="analytics-panel-heading">
        <h2>{title}</h2>
        <span>Top {rows.length}</span>
      </div>
      {rows.length ? (
        <div className="analytics-rank-list">
          {rows.map((row) => (
            <div className="analytics-rank-row" key={row.name}>
              <span className="analytics-rank-name" title={row.name}>{row.name}</span>
              <span className="analytics-rank-track"><i style={{ width: `${(row.value / max) * 100}%` }} /></span>
              <span className="analytics-rank-value">{row.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      ) : <p className="analytics-empty">No data for this period</p>}
    </section>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [previous, setPrevious] = useState<AnalyticsStats | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) throw new Error('Analytics API is not configured');
      const [currentResponse, previousResponse] = await Promise.all([
        fetch(`${base}/analytics/stats?days=${days}`),
        fetch(`${base}/analytics/stats?days=${days}&previous=true`),
      ]);
      if (!currentResponse.ok || !previousResponse.ok) throw new Error('Could not load analytics');
      setStats(await currentResponse.json());
      setPrevious(await previousResponse.json());
      setError(null);
    } catch (cause) {
      setStats(null);
      setPrevious(null);
      setError(cause instanceof Error ? cause.message : 'Could not load analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dailyTraffic = useMemo(() => {
    if (!stats) return [];
    const totals = new Map<string, number>();
    Object.entries(stats.hourly_stats || {}).forEach(([key, views]) => {
      const date = key.slice(0, 10);
      totals.set(date, (totals.get(date) || 0) + views);
    });
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const points = [];
    for (let offset = days; offset >= 0; offset -= 1) {
      const day = new Date(end);
      day.setUTCDate(end.getUTCDate() - offset);
      const key = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`;
      points.push({ date: key, label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }), views: totals.get(key) || 0 });
    }
    return points;
  }, [stats, days]);

  const change = (current: number, old: number) => {
    if (old === 0) return current > 0 ? 'New' : '—';
    const delta = ((current - old) / old) * 100;
    return `${delta > 0 ? '+' : ''}${delta.toFixed(0)}%`;
  };
  const pages = rank(stats?.pages, 5).map((row) => ({ ...row, name: formatPath(row.name) }));
  const countries = rank(stats?.countries, 4);
  const cities = rank(stats?.cities, 4);

  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <div>
          <p className="analytics-eyebrow">SITE ANALYTICS</p>
          <h1>Traffic</h1>
        </div>
        <div className="analytics-header-right">
          <span className="analytics-period-label">Last {days} days</span>
          <div className="analytics-period" aria-label="Select time period">
            {[7, 30, 90].map((period) => (
              <button key={period} onClick={() => setDays(period)} aria-pressed={days === period}>
                {period}d
              </button>
            ))}
          </div>
        </div>
      </header>

      {error && <div className="analytics-error">{error}</div>}
      {loading && !stats ? (
        <div className="analytics-loading">Loading traffic…</div>
      ) : stats && (
        <>
          <div className="analytics-metrics">
            {[
              { label: 'Page views', value: stats.total_page_views, prior: previous?.total_page_views },
              { label: 'Visitors', value: stats.unique_visitors, prior: previous?.unique_visitors },
              { label: 'Unique IPs', value: stats.unique_ips, prior: previous?.unique_ips },
            ].map((metric) => (
              <div className="analytics-metric" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value.toLocaleString()}</strong>
                <small>{change(metric.value, metric.prior || 0)} <em>vs prior {days}d</em></small>
              </div>
            ))}
          </div>

          <section className="analytics-panel analytics-chart-panel">
            <div className="analytics-panel-heading">
              <h2>Visits over time</h2>
              <span>Daily page views</span>
            </div>
            <div className="analytics-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTraffic} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accent} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={line} strokeDasharray="2 5" />
                  <XAxis dataKey="label" tick={{ fill: muted, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={28} />
                  <YAxis allowDecimals={false} tick={{ fill: muted, fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={{ background: 'var(--background-elevated)', border: `1px solid ${line}`, borderRadius: 8, color: ink, fontSize: 12 }} labelStyle={{ color: muted }} />
                  <Area type="monotone" dataKey="views" name="Page views" stroke={accent} strokeWidth={2} fill="url(#trafficFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="analytics-lists">
            <ListPanel title="Top pages" rows={pages} />
            <ListPanel title="Countries" rows={countries} />
            <ListPanel title="Cities" rows={cities} />
          </div>
        </>
      )}
    </div>
  );
}
