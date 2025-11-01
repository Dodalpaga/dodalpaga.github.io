import React, { useState, useEffect, useCallback } from 'react';
import { Container } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = [
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#06b6d4',
  '#6366f1',
];

interface AnalyticsStats {
  total_page_views: number;
  unique_visitors: number;
  unique_ips: number;
  pages: Record<string, number>;
  event_types: Record<string, number>;
  hourly_stats: Record<string, number>;
  countries: Record<string, number>;
  cities: Record<string, number>;
  top_referrers: Record<string, number>;
  period_days: number;
}

interface Visitor {
  ip: string;
  country: string;
  country_code: string;
  city: string;
  region: string;
  isp: string;
  latitude: number | null;
  longitude: number | null;
  first_visit: string;
  last_visit: string;
  page_views: number;
}

interface VisitorsResponse {
  visitors: Visitor[];
  total_unique_ips: number;
  period_days: number;
}

interface ChangeData {
  percent: string;
  positive: boolean;
}

const calculatePeriodChange = (
  current: number,
  previous: number
): ChangeData | null => {
  if (previous === 0) {
    return current > 0 ? { percent: '∞', positive: true } : null;
  }
  const change = ((current - previous) / previous) * 100;
  return {
    percent: Math.abs(change).toFixed(1),
    positive: change >= 0,
  };
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  change?: ChangeData | null;
  explanation?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = '#3b82f6',
  change,
  explanation,
}) => (
  <div
    className="h-full rounded-lg p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    style={{
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `2px solid ${color}30`,
    }}
  >
    {explanation ? (
      <div className="group relative">
        <div
          className="text-xs font-medium uppercase tracking-wider mb-2 cursor-help"
          style={{ color: 'var(--foreground)' }}
        >
          {title}
          <span className="ml-1 opacity-60">
            <InfoIcon />
          </span>
        </div>
        <div className="absolute left-0 top-full mt-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-lg">
          {explanation}
        </div>
      </div>
    ) : (
      <div
        className="text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--foreground)' }}
      >
        {title}
      </div>
    )}
    <div className="flex items-baseline gap-2 my-2">
      <div className="text-4xl font-bold" style={{ color }}>
        {value}
      </div>
      {change && (
        <div
          className="flex items-center gap-1 text-sm font-semibold"
          style={{
            color: change.positive ? '#10b981' : '#ef4444',
          }}
        >
          <span>{change.positive ? '↑' : '↓'}</span>
          <span>{change.percent === '∞' ? 'New' : `${change.percent}%`}</span>
        </div>
      )}
    </div>
    {subtitle && (
      <div className="text-sm" style={{ color: 'var(--foreground)' }}>
        {subtitle}
      </div>
    )}
  </div>
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <div
    className="rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-transform duration-200"
    style={{
      background: 'var(--background-transparent)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}
  >
    <h3
      className="text-xl font-bold mb-4"
      style={{ color: 'var(--foreground)' }}
    >
      {title}
    </h3>
    {children}
  </div>
);

interface TooltipPayload {
  name?: string;
  value: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 rounded-lg shadow-xl border"
        style={{
          background: 'var(--background-transparent)',
          backdropFilter: 'blur(8px)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        <div
          className="font-semibold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: entry.color || COLORS[index % COLORS.length],
                }}
              />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                {entry.name || 'Views'}
              </span>
            </div>
            <span
              className="font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [prevStats, setPrevStats] = useState<AnalyticsStats | null>(null);
  const [visitors, setVisitors] = useState<VisitorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'visitors' | 'geography' | 'behavior'
  >('overview');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, visitorsRes, prevStatsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/stats?days=${days}`
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/visitors?days=${days}`
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/analytics/stats?days=${days}&previous=true`
        ),
      ]);

      if (!statsRes.ok || !visitorsRes.ok || !prevStatsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const statsData: AnalyticsStats = await statsRes.json();
      const visitorsData: VisitorsResponse = await visitorsRes.json();
      const prevData: AnalyticsStats = await prevStatsRes.json();

      setStats(statsData);
      setPrevStats(prevData);
      setVisitors(visitorsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setStats(null);
      setPrevStats(null);
      setVisitors(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateHourlyData = () => {
    if (!stats) return [];
    const data = [];
    const now = new Date();
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    for (let d = new Date(start); d <= now; d.setHours(d.getHours() + 1)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hour = String(d.getHours()).padStart(2, '0');
      const key = `${year}-${month}-${day} ${hour}:00`;
      data.push({
        name: key,
        views: stats.hourly_stats[key] || 0,
      });
    }
    return data;
  };

  const hourlyData = generateHourlyData();

  const countriesData = stats?.countries
    ? Object.entries(stats.countries)
        .map(([country, count]) => ({ name: country, value: count }))
        .sort((a, b) => b.value - a.value)
    : [];

  const pagesData = stats?.pages
    ? Object.entries(stats.pages)
        .map(([page, count]) => ({
          name: page === '/' ? 'Home' : page,
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  const citiesData = stats?.cities
    ? Object.entries(stats.cities)
        .map(([city, count]) => ({ name: city, value: count }))
        .sort((a, b) => b.value - a.value)
    : [];

  const avgViewsPerVisitor = stats
    ? (stats.total_page_views / Math.max(stats.unique_visitors, 1)).toFixed(2)
    : '0';
  const bounceRate =
    stats && visitors
      ? (
          (visitors.visitors.filter((v: Visitor) => v.page_views === 1).length /
            Math.max(stats.unique_ips, 1)) *
          100
        ).toFixed(1)
      : '0';
  const avgSessionLength = visitors
    ? (
        visitors.visitors.reduce((sum: number, v: Visitor) => {
          const firstTime = new Date(v.first_visit).getTime();
          const lastTime = new Date(v.last_visit).getTime();
          return sum + (lastTime - firstTime);
        }, 0) /
        Math.max(visitors.total_unique_ips, 1) /
        60000
      ).toFixed(1)
    : '0';

  const topVisitors = visitors?.visitors.slice(0, 10) || [];
  const countryDistribution = countriesData.reduce(
    (sum, c) => sum + c.value,
    0
  );
  const returnVisitorsRate =
    stats && visitors
      ? (
          (visitors.visitors.filter((v: Visitor) => v.page_views > 1).length /
            Math.max(stats.unique_ips, 1)) *
          100
        ).toFixed(1)
      : '0';
  const avgPagesPerSession =
    visitors && visitors.total_unique_ips > 0
      ? (
          visitors.visitors.reduce(
            (sum: number, v: Visitor) => sum + v.page_views,
            0
          ) / visitors.total_unique_ips
        ).toFixed(2)
      : '0';

  const topCountries = countriesData.slice(0, 5);
  const topCities = citiesData.slice(0, 8);

  const totalViewsChange =
    stats && prevStats
      ? calculatePeriodChange(
          stats.total_page_views,
          prevStats.total_page_views
        )
      : null;

  const uniqueVisitorsChange =
    stats && prevStats
      ? calculatePeriodChange(stats.unique_visitors, prevStats.unique_visitors)
      : null;

  const uniqueIpsChange =
    stats && prevStats
      ? calculatePeriodChange(stats.unique_ips, prevStats.unique_ips)
      : null;

  return (
    <Container
      maxWidth={false} // Pass boolean false, not a string
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-lg" style={{ color: 'var(--foreground)' }}>
          Real-time insights over the last {days} days vs previous {days} days
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                days === d
                  ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['overview', 'geography', 'behavior', 'visitors'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6 w-full max-w-2xl">
          <p className="text-red-700" style={{ color: 'var(--foreground)' }}>
            Error: {error}
          </p>
        </div>
      )}

      {stats && activeTab === 'overview' && (
        <div className="w-full max-w-7xl space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Views"
              value={stats.total_page_views}
              color="#f59e0b"
              explanation="Total page views in the selected period."
              change={totalViewsChange}
            />
            <StatCard
              title="Unique Visitors"
              value={stats.unique_visitors}
              color="#10b981"
              explanation="Distinct users who visited."
              change={uniqueVisitorsChange}
            />
            <StatCard
              title="Unique IPs"
              value={stats.unique_ips}
              color="#f59e0b"
              explanation="Unique IP addresses detected."
              change={uniqueIpsChange}
            />
            <StatCard
              title="Avg Views/Visitor"
              value={avgViewsPerVisitor}
              color="#8b5cf6"
              explanation="Average page views per visitor."
            />
            <StatCard
              title="Return Visitors"
              value={`${returnVisitorsRate}%`}
              color="#06b6d4"
              explanation="Visitors who returned (multiple pages)."
            />
            <StatCard
              title="Bounce Rate"
              value={`${bounceRate}%`}
              color="#ef4444"
              explanation="Visitors who left after one page."
            />
            <StatCard
              title="Avg Session (min)"
              value={avgSessionLength}
              color="#ec4899"
              explanation="Average time spent per session."
            />
            <StatCard
              title="Pages/Session"
              value={avgPagesPerSession}
              color="#14b8a6"
              explanation="Average pages viewed per session."
            />
            <StatCard
              title="Countries"
              value={countriesData.length}
              subtitle="with visitors"
              color="#f97316"
              explanation="Unique countries with visits."
            />
            <StatCard
              title="Top Pages"
              value={Object.keys(stats.pages).length}
              subtitle="tracked"
              color="#6366f1"
              explanation="Number of tracked pages."
            />
          </div>

          {/* Traffic Over Time */}
          <ChartCard title="Traffic Over Time">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="name"
                  stroke="var(--foreground)"
                  tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                />
                <YAxis
                  stroke="var(--foreground)"
                  tick={{ fill: 'var(--foreground)' }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Pages */}
          <ChartCard title="Top Pages">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={pagesData.slice(0, 8)} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  type="number"
                  stroke="var(--foreground)"
                  tick={{ fill: 'var(--foreground)' }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  stroke="var(--foreground)"
                  tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top Countries & Cities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top Countries">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={topCountries}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={120}
                    fill="#f59e0b"
                    dataKey="value"
                  >
                    {topCountries.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Top Cities">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topCities}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="var(--foreground)"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                  />
                  <YAxis
                    stroke="var(--foreground)"
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {stats && activeTab === 'geography' && (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl shadow-lg overflow-hidden p-6">
            <h3 className="text-xl font-bold mb-4">Country Distribution</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">
                      Country
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Visits
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {countriesData.map((country, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{country.name}</td>
                      <td className="px-4 py-3 text-right">{country.value}</td>
                      <td className="px-4 py-3 text-right">
                        {((country.value / countryDistribution) * 100).toFixed(
                          1
                        )}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Geographic Summary</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm mb-1">Total Countries</p>
                <p className="text-4xl font-bold text-blue-500">
                  {countriesData.length}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1">Top Country</p>
                <p className="text-2xl font-bold text-green-600">
                  {countriesData[0]?.name || 'N/A'}
                </p>
                <p className="text-sm">{countriesData[0]?.value || 0} visits</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && activeTab === 'behavior' && (
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl shadow-lg overflow-hidden p-6">
            <h3 className="text-xl font-bold mb-4">Page Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Page</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Views
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagesData.map((page, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="inline-block px-3 py-1 rounded-full text-sm">
                          {page.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{page.value}</td>
                      <td className="px-4 py-3 text-right">
                        {((page.value / stats.total_page_views) * 100).toFixed(
                          1
                        )}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Behavior Metrics</h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm mb-1">Bounce Rate</p>
                <p className="text-4xl font-bold text-red-500">{bounceRate}%</p>
              </div>
              <div>
                <p className="text-sm mb-1">Return Visitors</p>
                <p className="text-4xl font-bold text-green-500">
                  {returnVisitorsRate}%
                </p>
              </div>
              <div>
                <p className="text-sm mb-1">Avg Pages/Session</p>
                <p className="text-4xl font-bold text-blue-500">
                  {avgPagesPerSession}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {visitors && activeTab === 'visitors' && (
        <div className="w-full max-w-7xl rounded-xl shadow-lg overflow-hidden p-6">
          <h3 className="text-xl font-bold mb-4">
            Top Visitors ({visitors.total_unique_ips} total)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Country</th>
                  <th className="px-4 py-3 text-left font-semibold">City</th>
                  <th className="px-4 py-3 text-left font-semibold">ISP</th>
                  <th className="px-4 py-3 text-center font-semibold">Views</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody>
                {topVisitors.map((visitor: Visitor) => {
                  const duration = Math.round(
                    (new Date(visitor.last_visit).getTime() -
                      new Date(visitor.first_visit).getTime()) /
                      60000
                  );
                  return (
                    <tr key={visitor.ip} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {visitor.country_code && (
                            <span>
                              {String.fromCodePoint(
                                ...visitor.country_code
                                  .toUpperCase()
                                  .split('')
                                  .map((c) => c.charCodeAt(0) + 127397)
                              )}
                            </span>
                          )}
                          <span>{visitor.country}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{visitor.city}</td>
                      <td className="px-4 py-3 text-sm opacity-75">
                        {visitor.isp}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-blue-500">
                        {visitor.page_views}
                      </td>
                      <td className="px-4 py-3">{duration} min</td>
                      <td className="px-4 py-3">
                        {new Date(visitor.last_visit).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  );
}
