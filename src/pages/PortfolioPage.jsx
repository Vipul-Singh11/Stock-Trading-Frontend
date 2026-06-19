import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import MetricCard from '../components/common/MetricCard.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getPortfolio } from '../services/portfolioService.js';
import { getApiErrorMessage, formatNumber } from '../utils/formatters.js';

const COLORS = ['#00c2a8', '#4aa3ff', '#ffb020', '#ff4d6d', '#8f9cff', '#35d7ff'];

function PortfolioPage() {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadPortfolio() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await getPortfolio(user.id);

        if (mounted) {
          setHoldings(data || []);
        }
      } catch (loadError) {
        if (mounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load portfolio'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadPortfolio();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const totalQuantity = holdings.reduce((sum, holding) => sum + (holding.quantity || 0), 0);
  const totalReserved = holdings.reduce((sum, holding) => sum + (holding.reservedQuantity || 0), 0);
  const totalAvailable = holdings.reduce((sum, holding) => sum + (holding.availableQuantity || 0), 0);

  const allocationData = holdings.map((holding) => ({
    name: holding.stockSymbol,
    value: holding.quantity,
  }));

  return (
    <>
      <PageHeader
        title="Portfolio"
        subtitle="Holdings overview with allocation and quantity distribution analytics."
      />
      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2.5}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={4}>
              <MetricCard title="Total Holdings" value={formatNumber(totalQuantity)} subtitle="Shares owned" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard title="Reserved" value={formatNumber(totalReserved)} subtitle="Shares in open orders" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard title="Available" value={formatNumber(totalAvailable)} subtitle="Ready to sell" />
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 2.25, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>Portfolio Allocation</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        label
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111a2b',
                          borderColor: '#2a3b5d',
                          borderRadius: 10,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 2.25, height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>Holdings Distribution</Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={holdings}>
                      <XAxis dataKey="stockSymbol" stroke="#9aa9c3" />
                      <YAxis stroke="#9aa9c3" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111a2b',
                          borderColor: '#2a3b5d',
                          borderRadius: 10,
                        }}
                      />
                      <Bar dataKey="availableQuantity" fill="#00c2a8" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="reservedQuantity" fill="#ffb020" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stock Symbol</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Reserved Quantity</TableCell>
                  <TableCell align="right">Available Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.stockSymbol}>
                    <TableCell>
                      <Typography fontWeight={700}>{holding.stockSymbol}</Typography>
                    </TableCell>
                    <TableCell align="right">{formatNumber(holding.quantity)}</TableCell>
                    <TableCell align="right">{formatNumber(holding.reservedQuantity)}</TableCell>
                    <TableCell align="right">{formatNumber(holding.availableQuantity)}</TableCell>
                  </TableRow>
                ))}
                {!holdings.length ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary" textAlign="center">No portfolio holdings found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}
    </>
  );
}

export default PortfolioPage;
