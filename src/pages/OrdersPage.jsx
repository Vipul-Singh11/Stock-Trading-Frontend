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
import { cancelOrder, getOrders } from '../services/orderService.js';
import { formatCurrency, formatDateTime, getApiErrorMessage } from '../utils/formatters.js';

const statusColors = {
  PENDING: 'warning',
  PARTIALLY_FILLED: 'info',
  EXECUTED: 'success',
  CANCELLED: 'default',
};

function isOrderCancellable(status) {
  return status === 'PENDING' || status === 'PARTIALLY_FILLED';
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  async function loadOrders() {
    setIsLoading(true);
    setError('');

    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load orders'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredOrders = orders.filter((order) => {
    const statusMatch = statusFilter === 'ALL' || order.status === statusFilter;
    const searchMatch = !normalizedSearch
      || String(order.id).includes(normalizedSearch)
      || order.stockSymbol?.toLowerCase().includes(normalizedSearch)
      || order.orderType?.toLowerCase().includes(normalizedSearch);

    return statusMatch && searchMatch;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (sortBy === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
    }

    if (sortBy === 'price') {
      return ((Number(a.price) || 0) - (Number(b.price) || 0)) * direction;
    }

    if (sortBy === 'quantity') {
      return ((Number(a.quantity) || 0) - (Number(b.quantity) || 0)) * direction;
    }

    return String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')) * direction;
  });

  const handleCancel = async (orderId) => {
    setError('');
    setMessage('');
    setCancellingId(orderId);

    try {
      await cancelOrder(orderId);
      setMessage(`Order #${orderId} cancelled successfully.`);
      await loadOrders();
    } catch (cancelError) {
      setError(getApiErrorMessage(cancelError, 'Unable to cancel order'));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Order status tracking, partial fills, and cancellations."
        action={<Button onClick={loadOrders} variant="outlined">Refresh</Button>}
      />
      <Stack spacing={2}>
        {message ? <Alert severity="success">{message}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
      </Stack>
      <Grid container spacing={2} sx={{ mt: 0.5, mb: 1 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search orders"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order ID, symbol, side"
            value={search}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={2.5}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PARTIALLY_FILLED">Partially Filled</MenuItem>
              <MenuItem value="EXECUTED">Executed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
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
              <MenuItem value="createdAt">Created Time</MenuItem>
              <MenuItem value="stockSymbol">Symbol</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="quantity">Quantity</MenuItem>
              <MenuItem value="status">Status</MenuItem>
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
        <TableContainer component={Paper} elevation={0} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Side</TableCell>
                <TableCell>Execution</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Remaining</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell><Typography fontWeight={700}>{order.stockSymbol}</Typography></TableCell>
                  <TableCell>
                    <Chip
                      color={order.orderType === 'BUY' ? 'success' : 'error'}
                      label={order.orderType}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{order.executionType}</TableCell>
                  <TableCell align="right">{order.quantity}</TableCell>
                  <TableCell align="right">{order.remainingQuantity}</TableCell>
                  <TableCell align="right">{formatCurrency(order.price)}</TableCell>
                  <TableCell>
                    <Chip
                      color={statusColors[order.status] || 'default'}
                      label={order.status}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                  <TableCell align="right">
                    {isOrderCancellable(order.status) ? (
                      <Button
                        color="error"
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancel(order.id)}
                        size="small"
                        variant="contained"
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    ) : (
                      <Button
                        color="inherit"
                        disabled
                        size="small"
                        variant="outlined"
                      >
                        Not Cancellable
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!sortedOrders.length ? (
                <TableRow>
                  <TableCell colSpan={10}>
                    <Typography color="text.secondary" textAlign="center">No orders match your filters.</Typography>
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

export default OrdersPage;
