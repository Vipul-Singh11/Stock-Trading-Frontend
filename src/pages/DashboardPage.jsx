import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
import WalletTransactionDialog from '../components/wallet/WalletTransactionDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getOrders } from '../services/orderService.js';
import { getPortfolioSummary, getTradeHistory } from '../services/portfolioService.js';
import { creditWallet, debitWallet } from '../services/userService.js';
import { formatCurrency, formatDateTime, getApiErrorMessage } from '../utils/formatters.js';
import { generateMockPriceHistory } from '../utils/mockPriceHistory.js';

function DashboardPage() {
  const { user, refreshCurrentUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentTrades, setRecentTrades] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [walletDialog, setWalletDialog] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletError, setWalletError] = useState('');
  const [walletMessage, setWalletMessage] = useState('');
  const [isWalletSubmitting, setIsWalletSubmitting] = useState(false);

  const walletCards = [
    {
      title: 'Wallet Balance',
      value: formatCurrency(user?.walletBalance),
      subtitle: 'Total capital in your account',
    },
    {
      title: 'Reserved Balance',
      value: formatCurrency(user?.reservedBalance),
      subtitle: 'Locked by open orders',
    },
    {
      title: 'Available Balance',
      value: formatCurrency(user?.availableBalance),
      subtitle: 'Ready for trading',
    },
  ];

  const openWalletDialog = (type) => {
    setWalletDialog(type);
    setWalletAmount('');
    setWalletError('');
    setWalletMessage('');
  };

  const closeWalletDialog = () => {
    if (isWalletSubmitting) {
      return;
    }

    setWalletDialog(null);
    setWalletAmount('');
    setWalletError('');
  };

  const validateWalletAmount = (value) => {
    const parsedAmount = Number(value);

    if (!value || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return 'Enter a valid amount greater than 0.';
    }

    return '';
  };

  const handleWalletSubmit = async (event) => {
    event.preventDefault();
    setWalletMessage('');

    const amountValidationMessage = validateWalletAmount(walletAmount);

    if (amountValidationMessage) {
      setWalletError(amountValidationMessage);
      return;
    }

    if (!user?.id || !walletDialog) {
      setWalletError('Unable to process the request right now.');
      return;
    }

    setWalletError('');
    setIsWalletSubmitting(true);

    try {
      const amount = Number(walletAmount);

      if (walletDialog === 'credit') {
        await creditWallet(user.id, amount);
      } else {
        await debitWallet(user.id, amount);
      }

      await refreshCurrentUser();
      setWalletMessage(
        walletDialog === 'credit'
          ? 'Wallet credited successfully. Balances updated.'
          : 'Wallet debited successfully. Balances updated.',
      );
      setWalletDialog(null);
      setWalletAmount('');
    } catch (submitError) {
      setWalletError(
        getApiErrorMessage(
          submitError,
          walletDialog === 'credit' ? 'Unable to credit wallet' : 'Unable to debit wallet',
        ),
      );
    } finally {
      setIsWalletSubmitting(false);
    }
  };

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
      <Stack spacing={2} sx={{ mb: 3 }}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {walletMessage ? <Alert severity="success">{walletMessage}</Alert> : null}
      </Stack>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 2.75 }}>
              <Stack spacing={0.75} sx={{ mb: 2.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                  Wallet Management
                </Typography>
                <Typography variant="h5">Capital controls and balance overview</Typography>
                <Typography color="text.secondary">
                  Manage available funds without leaving the trading dashboard.
                </Typography>
              </Stack>
              <Grid container spacing={2.5}>
                {walletCards.map((card) => (
                  <Grid item xs={12} md={4} key={card.title}>
                    <MetricCard
                      title={card.title}
                      value={card.value}
                      subtitle={card.subtitle}
                    />
                  </Grid>
                ))}
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2.25, height: '100%' }}>
                      <Stack spacing={1.5} sx={{ height: '100%' }}>
                        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                          Actions
                        </Typography>
                        <Typography variant="h6">Fund your wallet</Typography>
                        <Typography color="text.secondary" variant="body2">
                          Add capital or withdraw funds using the authenticated trading account.
                        </Typography>
                        <Stack spacing={1.25} sx={{ pt: 0.5, mt: 'auto' }}>
                          <Button
                            color="success"
                            disabled={!user?.id}
                            fullWidth
                            onClick={() => openWalletDialog('credit')}
                            variant="contained"
                          >
                            Credit Funds
                          </Button>
                          <Button
                            color="error"
                            disabled={!user?.id}
                            fullWidth
                            onClick={() => openWalletDialog('debit')}
                            variant="outlined"
                          >
                            Debit Funds
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
      <WalletTransactionDialog
        amount={walletAmount}
        amountError={walletError}
        confirmColor={walletDialog === 'credit' ? 'success' : 'error'}
        confirmLabel={walletDialog === 'credit' ? 'Credit Wallet' : 'Debit Wallet'}
        description={
          walletDialog === 'credit'
            ? 'Add cash to your wallet using the currently signed-in account.'
            : 'Withdraw cash from your wallet using the currently signed-in account.'
        }
        error={walletError}
        isSubmitting={isWalletSubmitting}
        onAmountChange={setWalletAmount}
        onClose={closeWalletDialog}
        onSubmit={handleWalletSubmit}
        open={Boolean(walletDialog)}
        title={walletDialog === 'credit' ? 'Credit Wallet' : 'Debit Wallet'}
      />
    </>
  );
}

export default DashboardPage;
