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
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

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

export default function Analytics() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [visitors, setVisitors] = useState<VisitorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const [activeTab, setActiveTab] = useState<'overview' | 'visitors'>(
    'overview'
  );

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

  const hourlyData = stats?.hourly_stats
    ? Object.entries(stats.hourly_stats).map(
        ([time, count]: [string, number]) => ({
          name: time.slice(-5),
          views: count,
        })
      )
    : [];

  const countriesData = stats?.countries
    ? Object.entries(stats.countries)
        .map(([country, count]: [string, number]) => ({
          name: country,
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    : [];

  const citiesData = stats?.cities
    ? Object.entries(stats.cities).map(([city, count]: [string, number]) => ({
        name: city,
        value: count,
      }))
    : [];

  const geoMapData = visitors?.visitors
    ? visitors.visitors
        .filter((v) => v.latitude && v.longitude)
        .map((v) => ({
          name: `${v.city}, ${v.country}`,
          latitude: v.latitude,
          longitude: v.longitude,
          value: v.page_views,
        }))
    : [];

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        height: '100%',
        py: 4,
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ mb: 2, color: '#333' }}>
        📊 Analytics Dashboard
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: '#666', textAlign: 'center' }}
      >
        Track your website performance and visitor insights
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              variant={days === d ? 'contained' : 'outlined'}
              onClick={() => setDays(d)}
              size="small"
            >
              {d} days
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={activeTab === 'overview' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('overview')}
            size="small"
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'visitors' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('visitors')}
            size="small"
          >
            Visitors
          </Button>
        </Box>
      </Box>

      {loading && <CircularProgress />}
      {error && <Typography color="error">Error: {error}</Typography>}

      {stats && activeTab === 'overview' && (
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {/* KPI Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Views
                </Typography>
                <Typography variant="h5">{stats.total_page_views}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Unique Visitors
                </Typography>
                <Typography variant="h5">{stats.unique_visitors}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Unique IPs
                </Typography>
                <Typography variant="h5">{stats.unique_ips}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Views/Visitor
                </Typography>
                <Typography variant="h5">
                  {(
                    stats.total_page_views / Math.max(stats.unique_visitors, 1)
                  ).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Hourly Chart */}
          {hourlyData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Views Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="views" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Countries Chart */}
          {countriesData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Countries
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={countriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {countriesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Cities Chart */}
          {citiesData.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Cities
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={citiesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {visitors && activeTab === 'visitors' && (
        <Grid container spacing={3} sx={{ width: '100%' }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📍 Visitors List ({visitors.total_unique_ips} unique IPs)
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>
                          <strong>IP</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Country</strong>
                        </TableCell>
                        <TableCell>
                          <strong>City</strong>
                        </TableCell>
                        <TableCell>
                          <strong>ISP</strong>
                        </TableCell>
                        <TableCell align="center">
                          <strong>Views</strong>
                        </TableCell>
                        <TableCell>
                          <strong>First Visit</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Last Visit</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visitors.visitors.map((visitor) => (
                        <TableRow key={visitor.ip} hover>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            {visitor.ip}
                          </TableCell>
                          <TableCell>
                            {visitor.country_code && (
                              <span style={{ marginRight: '8px' }}>
                                {String.fromCodePoint(
                                  ...visitor.country_code
                                    .toUpperCase()
                                    .split('')
                                    .map((c) => c.charCodeAt(0) + 127397)
                                )}
                              </span>
                            )}
                            {visitor.country}
                          </TableCell>
                          <TableCell>{visitor.city}</TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            {visitor.isp}
                          </TableCell>
                          <TableCell align="center">
                            <strong>{visitor.page_views}</strong>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            {new Date(visitor.first_visit).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            {new Date(visitor.last_visit).toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
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
