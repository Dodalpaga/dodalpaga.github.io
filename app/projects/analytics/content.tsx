import React, { useState, useEffect, useCallback } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
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

const StatCard = ({
  title,
  value,
  subtitle,
  color = '#3b82f6',
  change,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  change?: string;
}) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `2px solid ${color}30`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 24px ${color}20`,
      },
    }}
  >
    <CardContent>
      <Typography
        color="var(--foreground)"
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, my: 1 }}>
        <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, color }}>
          {value}
        </Typography>
        {change && (
          <Typography sx={{ fontSize: '0.875rem', color: '#10b981' }}>
            {change}
          </Typography>
        )}
      </Box>
      {subtitle && (
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function Analytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
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
      const [statsRes, visitorsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL_ANALYTICS}/stats?days=${days}`
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL_ANALYTICS}/visitors?days=${days}`
        ),
      ]);

      if (!statsRes.ok || !visitorsRes.ok)
        throw new Error('Failed to fetch data');

      const statsData: AnalyticsStats = await statsRes.json();
      const visitorsData: VisitorsResponse = await visitorsRes.json();

      setStats(statsData);
      setVisitors(visitorsData);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStats(null);
      setVisitors(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Data processing
  const hourlyData = stats?.hourly_stats
    ? Object.entries(stats.hourly_stats)
        .map(([time, count]: [string, number]) => ({
          name: time.slice(-5),
          views: count,
        }))
        .slice(-24)
    : [];

  const countriesData = stats?.countries
    ? Object.entries(stats.countries)
        .map(([country, count]: [string, number]) => ({
          name: country,
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  const pagesData = stats?.pages
    ? Object.entries(stats.pages)
        .map(([page, count]: [string, number]) => ({
          name: page === '/' ? 'Home' : page,
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  const referrersData = stats?.top_referrers
    ? Object.entries(stats.top_referrers)
        .map(([referrer, count]: [string, number]) => ({
          name:
            referrer === 'direct'
              ? 'Direct'
              : new URL(referrer).hostname || referrer,
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  const citiesData = stats?.cities
    ? Object.entries(stats.cities)
        .map(([city, count]: [string, number]) => ({
          name: city,
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  const avgViewsPerVisitor = stats
    ? (stats.total_page_views / Math.max(stats.unique_visitors, 1)).toFixed(2)
    : '0';

  const bounceRate =
    stats && visitors
      ? (
          (visitors.visitors.filter((v) => v.page_views === 1).length /
            Math.max(stats.unique_ips, 1)) *
          100
        ).toFixed(1)
      : '0';

  const avgSessionLength = visitors
    ? (
        visitors.visitors.reduce((sum, v) => {
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
          (visitors.visitors.filter((v) => v.page_views > 1).length /
            Math.max(stats.unique_ips, 1)) *
          100
        ).toFixed(1)
      : '0';

  const avgPagesPerSession =
    visitors && visitors.total_unique_ips > 0
      ? (
          visitors.visitors.reduce((sum, v) => sum + v.page_views, 0) /
          visitors.total_unique_ips
        ).toFixed(2)
      : '0';

  const topCountries = countriesData.slice(0, 5);
  const topCities = citiesData.slice(0, 8);

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        height: '100%',
        py: 4,
        maxWidth: '1600px',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Analytics Dashboard
        </Typography>
        <Typography sx={{ color: '#94a3b8', fontSize: '1.125rem' }}>
          Real-time insights into my website performance over the last {days}{' '}
          days
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'contained' : 'outlined'}
              onClick={() => setDays(d)}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                ...(days === d && {
                  background:
                    'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                  boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                }),
              }}
            >
              {d} days
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['overview', 'geography', 'behavior', 'visitors'] as const).map(
            (tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'contained' : 'outlined'}
                onClick={() => setActiveTab(tab)}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  ...(activeTab === tab && {
                    background:
                      'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                    boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                  }),
                }}
              >
                {tab}
              </Button>
            )
          )}
        </Box>
      </Box>

      {loading && <CircularProgress sx={{ mx: 'auto', my: 4 }} />}
      {error && (
        <Card
          sx={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            mb: 3,
          }}
        >
          <CardContent>
            <Typography sx={{ color: '#fca5a5' }}>Error: {error}</Typography>
          </CardContent>
        </Card>
      )}

      {stats && activeTab === 'overview' && (
        <Grid container spacing={3}>
          {/* KPI Row 1 */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Total Views"
              value={stats.total_page_views}
              color="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Unique Visitors"
              value={stats.unique_visitors}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Unique IPs"
              value={stats.unique_ips}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Avg Views/Visitor"
              value={avgViewsPerVisitor}
              color="#8b5cf6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Return Visitors"
              value={`${returnVisitorsRate}%`}
              color="#06b6d4"
            />
          </Grid>

          {/* KPI Row 2 */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Bounce Rate"
              value={`${bounceRate}%`}
              color="#ef4444"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Avg Session (min)"
              value={avgSessionLength}
              color="#ec4899"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Pages/Session"
              value={avgPagesPerSession}
              color="#14b8a6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Countries"
              value={countriesData.length}
              subtitle="with visitors"
              color="#f97316"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Top Pages"
              value={Object.keys(stats.pages).length}
              subtitle="tracked"
              color="#6366f1"
            />
          </Grid>

          {/* Traffic Chart - Full Width */}
          <Grid item xs={12}>
            <Card
              sx={{
                background: '#1e293b',
                border: '1px solid #334155',
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 2,
                    color: '#f1f5f9',
                  }}
                >
                  Traffic Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient
                        id="colorViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts Row - Top Pages & Traffic Sources */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                background: '#1e293b',
                border: '1px solid #334155',
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 2,
                    color: '#f1f5f9',
                  }}
                >
                  Top Pages
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={pagesData.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#64748b" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                background: '#1e293b',
                border: '1px solid #334155',
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 2,
                    color: '#f1f5f9',
                  }}
                >
                  Traffic Sources
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={referrersData.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Charts Row - Geographic Distribution */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                background: '#1e293b',
                border: '1px solid #334155',
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 2,
                    color: '#f1f5f9',
                  }}
                >
                  Top Countries
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={topCountries}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={120}
                      fill="#3b82f6"
                      dataKey="value"
                    >
                      {topCountries.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Cities */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                background: '#1e293b',
                border: '1px solid #334155',
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 2,
                    color: '#f1f5f9',
                  }}
                >
                  Top Cities
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topCities}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {stats && activeTab === 'geography' && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ background: '#1e293b', border: '1px solid #334155' }}>
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 3,
                    color: '#f1f5f9',
                  }}
                >
                  Country Distribution
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#0f172a' }}>
                        <TableCell sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                          Country
                        </TableCell>
                        <TableCell
                          sx={{ color: '#cbd5e1', fontWeight: 700 }}
                          align="right"
                        >
                          Visits
                        </TableCell>
                        <TableCell
                          sx={{ color: '#cbd5e1', fontWeight: 700 }}
                          align="right"
                        >
                          % of Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {countriesData.map((country, idx) => (
                        <TableRow
                          key={idx}
                          sx={{ '&:hover': { backgroundColor: '#1e293b' } }}
                        >
                          <TableCell sx={{ color: '#e2e8f0' }}>
                            {country.name}
                          </TableCell>
                          <TableCell sx={{ color: '#e2e8f0' }} align="right">
                            {country.value}
                          </TableCell>
                          <TableCell sx={{ color: '#e2e8f0' }} align="right">
                            {(
                              (country.value / countryDistribution) *
                              100
                            ).toFixed(1)}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ background: '#1e293b', border: '1px solid #334155' }}>
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 3,
                    color: '#f1f5f9',
                  }}
                >
                  Geographic Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Total Countries
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#3b82f6',
                      }}
                    >
                      {countriesData.length}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Top Country
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#10b981',
                      }}
                    >
                      {countriesData[0]?.name || 'N/A'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {countriesData[0]?.value || 0} visits
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {stats && activeTab === 'behavior' && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ background: '#1e293b', border: '1px solid #334155' }}>
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 3,
                    color: '#f1f5f9',
                  }}
                >
                  Page Performance
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#0f172a' }}>
                        <TableCell sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                          Page
                        </TableCell>
                        <TableCell
                          sx={{ color: '#cbd5e1', fontWeight: 700 }}
                          align="right"
                        >
                          Views
                        </TableCell>
                        <TableCell
                          sx={{ color: '#cbd5e1', fontWeight: 700 }}
                          align="right"
                        >
                          % of Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagesData.map((page, idx) => (
                        <TableRow
                          key={idx}
                          sx={{ '&:hover': { backgroundColor: '#1e293b' } }}
                        >
                          <TableCell sx={{ color: '#e2e8f0' }}>
                            <Chip
                              label={page.name}
                              size="small"
                              sx={{ background: '#334155', color: '#e2e8f0' }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#e2e8f0' }} align="right">
                            {page.value}
                          </TableCell>
                          <TableCell sx={{ color: '#e2e8f0' }} align="right">
                            {(
                              (page.value / stats.total_page_views) *
                              100
                            ).toFixed(1)}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ background: '#1e293b', border: '1px solid #334155' }}>
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 3,
                    color: '#f1f5f9',
                  }}
                >
                  Behavior Metrics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Bounce Rate
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#ef4444',
                      }}
                    >
                      {bounceRate}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Return Visitors
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#10b981',
                      }}
                    >
                      {returnVisitorsRate}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      Avg Pages/Session
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: '#3b82f6',
                      }}
                    >
                      {avgPagesPerSession}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {visitors && activeTab === 'visitors' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ background: '#1e293b', border: '1px solid #334155' }}>
              <CardContent>
                <Typography
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    mb: 3,
                    color: '#f1f5f9',
                  }}
                >
                  Top Visitors ({visitors.total_unique_ips} total)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#0f172a' }}>
                        <TableCell sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                          Country
                        </TableCell>
                        <TableCell sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                          City
                        </TableCell>
                        <TableCell sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                          ISP
                        </TableCell>
                        <TableCell
                          sx={{ color: '#cbd5e1', fontWeight: 700 }}
                          align="center"
                        >
                          Views
                        </TableCell>
                        <TableCell sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                          Duration
                        </TableCell>
                        <TableCell sx={{ color: '#cbd5e1', fontWeight: 700 }}>
                          Last Seen
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topVisitors.map((visitor) => {
                        const duration = Math.round(
                          (new Date(visitor.last_visit).getTime() -
                            new Date(visitor.first_visit).getTime()) /
                            60000
                        );
                        return (
                          <TableRow
                            key={visitor.ip}
                            sx={{ '&:hover': { backgroundColor: '#334155' } }}
                          >
                            <TableCell sx={{ color: '#e2e8f0' }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
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
                                {visitor.country}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ color: '#e2e8f0' }}>
                              {visitor.city}
                            </TableCell>
                            <TableCell
                              sx={{ color: '#94a3b8', fontSize: '0.875rem' }}
                            >
                              {visitor.isp}
                            </TableCell>
                            <TableCell
                              sx={{ color: '#3b82f6', fontWeight: 700 }}
                              align="center"
                            >
                              {visitor.page_views}
                            </TableCell>
                            <TableCell sx={{ color: '#e2e8f0' }}>
                              {duration} min
                            </TableCell>
                            <TableCell sx={{ color: '#e2e8f0' }}>
                              {new Date(visitor.last_visit).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
