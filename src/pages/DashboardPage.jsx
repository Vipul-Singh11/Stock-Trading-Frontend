import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import PriceLineChart from '../components/charts/PriceLineChart.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import PlaceholderPanel from '../components/common/PlaceholderPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrders } from '../services/orderService.js';
import { getPortfolioSummary, getTradeHistory } from '../services/portfolioService.js';
import { formatCurrency, formatDateTime, getApiErrorMessage } from '../utils/formatters.js';
import { generateMockPriceHistory } from '../utils/mockPriceHistory.js';

function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [summaryData, tradesData, ordersData] = await Promise.all([
          getPortfolioSummary(user.id),
          getTradeHistory(user.id),
          getOrders(),
        ]);

        if (mounted) {
          setSummary(summaryData);
          setRecentTrades((tradesData || []).slice(0, 5));
          setOrders(ordersData || []);
        }
      } catch (loadError) {
        if (mounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load dashboard'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const activeOrders = orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED',
  );

  const executedOrders = orders.filter((order) => order.status === 'EXECUTED');
  const cancelledOrders = orders.filter((order) => order.status === 'CANCELLED');

  const chartSymbol = summary?.holdings?.[0]?.stockSymbol || 'AAPL';
  const chartBasePrice = Number(recentTrades?.[0]?.price || 180);
  const trendData = generateMockPriceHistory({
    symbol: chartSymbol,
    currentPrice: chartBasePrice,
    points: 40,
    intervalMinutes: 15,
  });

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Wallet, portfolio, order execution, and live trend intelligence."
      />
      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Wallet Balance"
            value={formatCurrency(user?.walletBalance)}
            subtitle="Total capital"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Reserved Balance"
            value={formatCurrency(user?.reservedBalance)}
            subtitle="Locked in open orders"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Available Balance"
            value={formatCurrency(user?.availableBalance)}
            subtitle="Deployable funds"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Active Orders"
            value={activeOrders.length}
            subtitle="Pending and partially filled"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Executed Orders"
            value={executedOrders.length}
            subtitle="Completed fills"
            trend={executedOrders.length}
            trendLabel="Completed"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard
            title="Cancelled Orders"
            value={cancelledOrders.length}
            subtitle="User/system cancelled"
            trend={-cancelledOrders.length}
            trendLabel="Cancelled"
          />
        </Grid>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2.25 }}>
            <PriceLineChart
              data={trendData}
              title={`${chartSymbol} Intraday Trend`}
              subtitle="Derived visualization from current live price until historical candles are integrated"
              lineColor="#3da5ff"
              height={320}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <PlaceholderPanel title="Portfolio Snapshot">
            <Stack spacing={1.25}>
              <Box>
                <Typography color="text.secondary" variant="body2">Current Value</Typography>
                <Typography variant="h5" color="text.primary">{formatCurrency(summary?.currentValue)}</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">Profit / Loss</Typography>
                <Typography
                  variant="h6"
                  color={Number(summary?.profitLoss || 0) >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(summary?.profitLoss)}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary" variant="body2">Holdings Count</Typography>
                <Typography variant="h6" color="text.primary">{summary?.holdings?.length || 0}</Typography>
              </Box>
            </Stack>
          </PlaceholderPanel>
        </Grid>
        <Grid item xs={12}>
          <PlaceholderPanel title="Recent Trades">
            <Stack spacing={1.5}>
              {recentTrades.length ? recentTrades.map((trade) => (
                <Box
                  key={trade.tradeId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 1,
                  }}
                >
                  <Box>
                    <Typography color="text.primary" fontWeight={700}>{trade.stockSymbol}</Typography>
                    <Typography variant="caption">{formatDateTime(trade.executionTime)}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography color="text.primary">{trade.quantity} shares</Typography>
                    <Typography variant="caption">{formatCurrency(trade.price)}</Typography>
                  </Box>
                </Box>
              )) : (
                <Typography>No recent trades found.</Typography>
              )}
            </Stack>
          </PlaceholderPanel>
        </Grid>
      </Grid>
    </>
  );
}

export default DashboardPage;
