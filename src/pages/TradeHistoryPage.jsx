import {
  Alert,
  Box,
  CircularProgress,
  Chip,
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
import { useAuth } from '../context/AuthContext.jsx';
import { getTradeHistory } from '../services/portfolioService.js';
import { formatCurrency, formatDateTime, getApiErrorMessage } from '../utils/formatters.js';

function TradeHistoryPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState([]);
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('executionTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadTrades() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await getTradeHistory(user.id);

        if (mounted) {
          setTrades(data || []);
        }
      } catch (loadError) {
        if (mounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load trade history'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadTrades();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredTrades = trades.filter((trade) => {
    const side = trade.buyerUserId === user?.id ? 'BUY' : 'SELL';
    const sideMatch = sideFilter === 'ALL' || sideFilter === side;
    const searchMatch = !normalizedSearch
      || String(trade.tradeId).includes(normalizedSearch)
      || trade.stockSymbol?.toLowerCase().includes(normalizedSearch)
      || side.toLowerCase().includes(normalizedSearch);

    return sideMatch && searchMatch;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (sortBy === 'executionTime') {
      return (new Date(a.executionTime).getTime() - new Date(b.executionTime).getTime()) * direction;
    }

    if (sortBy === 'price') {
      return ((Number(a.price) || 0) - (Number(b.price) || 0)) * direction;
    }

    if (sortBy === 'quantity') {
      return ((Number(a.quantity) || 0) - (Number(b.quantity) || 0)) * direction;
    }

    return String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')) * direction;
  });

  return (
    <>
      <PageHeader
        title="Trade History"
        subtitle="Completed trades for the signed-in user."
      />
      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search trades"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Trade ID or symbol"
            value={search}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2.5}>
          <FormControl fullWidth>
            <InputLabel>Side</InputLabel>
            <Select
              label="Side"
              onChange={(event) => setSideFilter(event.target.value)}
              value={sideFilter}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="BUY">Buy</MenuItem>
              <MenuItem value="SELL">Sell</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={2.5}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              label="Sort By"
              onChange={(event) => setSortBy(event.target.value)}
              value={sortBy}
            >
              <MenuItem value="executionTime">Execution Time</MenuItem>
              <MenuItem value="stockSymbol">Symbol</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
              <MenuItem value="price">Price</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth>
            <InputLabel>Direction</InputLabel>
            <Select
              label="Direction"
              onChange={(event) => setSortDirection(event.target.value)}
              value={sortDirection}
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Trade ID</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Side</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Execution Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTrades.map((trade) => {
                const side = trade.buyerUserId === user?.id ? 'BUY' : 'SELL';

                return (
                  <TableRow key={trade.tradeId}>
                    <TableCell>#{trade.tradeId}</TableCell>
                    <TableCell><Typography fontWeight={700}>{trade.stockSymbol}</Typography></TableCell>
                    <TableCell>
                      <Chip
                        color={side === 'BUY' ? 'success' : 'error'}
                        label={side}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{trade.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(trade.price)}</TableCell>
                    <TableCell>{formatDateTime(trade.executionTime)}</TableCell>
                  </TableRow>
                );
              })}
              {!sortedTrades.length ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary" textAlign="center">No trades match your filters.</Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

export default TradeHistoryPage;
