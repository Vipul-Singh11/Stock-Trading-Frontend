import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import { getOrderBook } from '../services/matchingEngineService.js';
import { getStocks } from '../services/stockService.js';
import { formatCurrency, getApiErrorMessage } from '../utils/formatters.js';

function OrderBookTable({ title, rows, emptyText, highlightOrderId, highlightColor }) {
  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={4}>
              <Typography variant="h6">{title}</Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>User ID</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.orderId}
              sx={
                row.orderId === highlightOrderId
                  ? {
                    backgroundColor: `${highlightColor}.main`,
                    '& td': { color: '#05101f', fontWeight: 700 },
                  }
                  : undefined
              }
            >
              <TableCell>#{row.orderId}</TableCell>
              <TableCell>{row.userId}</TableCell>
              <TableCell align="right">{formatCurrency(row.price)}</TableCell>
              <TableCell align="right">{row.quantity}</TableCell>
            </TableRow>
          ))}
          {!rows.length ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography color="text.secondary" textAlign="center">{emptyText}</Typography>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function OrderBookPage() {
  const [stocks, setStocks] = useState([]);
  const [symbol, setSymbol] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [orderBook, setOrderBook] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadStocks() {
      try {
        const data = await getStocks();

        if (mounted) {
          setStocks(data || []);
          setSymbol(data?.[0]?.symbol || '');
        }
      } catch (loadError) {
        if (mounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load stock symbols'));
        }
      }
    }

    loadStocks();

    return () => {
      mounted = false;
    };
  }, []);

  async function loadOrderBook(selectedSymbol = symbol) {
    if (!selectedSymbol) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await getOrderBook(selectedSymbol);
      setOrderBook(data);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load order book'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (symbol) {
      loadOrderBook(symbol);
    }
  }, [symbol]);

  useEffect(() => {
    if (!isAutoRefresh || !symbol) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      loadOrderBook(symbol);
    }, refreshInterval);

    return () => {
      window.clearInterval(timer);
    };
  }, [isAutoRefresh, refreshInterval, symbol]);

  const bestBid = orderBook?.buyOrders?.[0];
  const bestAsk = orderBook?.sellOrders?.[0];

  return (
    <>
      <PageHeader
        title="Order Book"
        subtitle="Buy and sell price levels by stock symbol."
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <TextField
              label="Symbol"
              onChange={(event) => setSymbol(event.target.value)}
              select
              size="small"
              sx={{ minWidth: 160 }}
              value={symbol}
            >
              {stocks.map((stock) => (
                <MenuItem key={stock.symbol} value={stock.symbol}>
                  {stock.symbol}
                </MenuItem>
              ))}
            </TextField>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Refresh</InputLabel>
              <Select
                label="Refresh"
                onChange={(event) => setRefreshInterval(Number(event.target.value))}
                value={refreshInterval}
              >
                <MenuItem value={3000}>3 sec</MenuItem>
                <MenuItem value={5000}>5 sec</MenuItem>
                <MenuItem value={10000}>10 sec</MenuItem>
              </Select>
            </FormControl>
            <Button
              onClick={() => setIsAutoRefresh((state) => !state)}
              variant={isAutoRefresh ? 'contained' : 'outlined'}
            >
              {isAutoRefresh ? 'Auto On' : 'Auto Off'}
            </Button>
            <Button onClick={() => loadOrderBook()} variant="outlined">Refresh</Button>
          </Stack>
        }
      />
      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
      {(bestBid || bestAsk) ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <Chip
            color="success"
            label={bestBid ? `Best Bid: ${formatCurrency(bestBid.price)} (${bestBid.quantity})` : 'Best Bid: -'}
          />
          <Chip
            color="error"
            label={bestAsk ? `Best Ask: ${formatCurrency(bestAsk.price)} (${bestAsk.quantity})` : 'Best Ask: -'}
          />
        </Stack>
      ) : null}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <OrderBookTable
            emptyText="No buy orders found."
            highlightColor="success"
            highlightOrderId={bestBid?.orderId}
            rows={orderBook?.buyOrders || []}
            title="Buy Orders"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <OrderBookTable
            emptyText="No sell orders found."
            highlightColor="error"
            highlightOrderId={bestAsk?.orderId}
            rows={orderBook?.sellOrders || []}
            title="Sell Orders"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default OrderBookPage;
