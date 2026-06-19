import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { placeOrder } from '../services/orderService.js';
import { getStocks } from '../services/stockService.js';
import { formatCurrency, getApiErrorMessage } from '../utils/formatters.js';

function PlaceOrderPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [form, setForm] = useState({
    stockSymbol: '',
    orderType: 'BUY',
    quantity: '',
    price: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadStocks() {
      try {
        const data = await getStocks();

        if (mounted) {
          setStocks(data || []);
          setForm((current) => ({
            ...current,
            stockSymbol: current.stockSymbol || data?.[0]?.symbol || '',
          }));
        }
      } catch (loadError) {
        if (mounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load stocks'));
        }
      }
    }

    loadStocks();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedStock = stocks.find((stock) => stock.symbol === form.stockSymbol);

  const handleChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleOrderTypeChange = (_, value) => {
    if (value) {
      setForm((current) => ({
        ...current,
        orderType: value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const savedOrder = await placeOrder({
        userId: user.id,
        stockSymbol: form.stockSymbol,
        quantity: Number(form.quantity),
        price: Number(form.price),
        orderType: form.orderType,
        executionType: 'LIMIT',
      });

      setMessage(`Order #${savedOrder.id} placed successfully.`);
      setForm((current) => ({
        ...current,
        quantity: '',
        price: '',
      }));
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to place order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Place Order"
        subtitle="Buy and sell limit orders."
      />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <ToggleButtonGroup
                    color={form.orderType === 'BUY' ? 'success' : 'error'}
                    exclusive
                    fullWidth
                    onChange={handleOrderTypeChange}
                    value={form.orderType}
                  >
                    <ToggleButton value="BUY">BUY</ToggleButton>
                    <ToggleButton value="SELL">SELL</ToggleButton>
                  </ToggleButtonGroup>
                  <TextField
                    fullWidth
                    label="Stock Symbol"
                    onChange={handleChange('stockSymbol')}
                    required
                    select
                    value={form.stockSymbol}
                  >
                    {stocks.map((stock) => (
                      <MenuItem key={stock.symbol} value={stock.symbol}>
                        {stock.symbol} - {stock.companyName}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        inputProps={{ min: 1 }}
                        label="Quantity"
                        onChange={handleChange('quantity')}
                        required
                        type="number"
                        value={form.quantity}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        inputProps={{ min: 0.01, step: 0.01 }}
                        label="Limit Price"
                        onChange={handleChange('price')}
                        required
                        type="number"
                        value={form.price}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    disabled
                    fullWidth
                    label="Execution Type"
                    value="LIMIT"
                  />
                  {message ? <Alert severity="success">{message}</Alert> : null}
                  {error ? <Alert severity="error">{error}</Alert> : null}
                  <Button
                    color={form.orderType === 'BUY' ? 'success' : 'error'}
                    disabled={isSubmitting || !user?.id}
                    size="large"
                    type="submit"
                    variant="contained"
                  >
                    Place {form.orderType} Order
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Selected Stock</Typography>
              {selectedStock ? (
                <Stack spacing={1}>
                  <Typography variant="h5">{selectedStock.symbol}</Typography>
                  <Typography color="text.secondary">{selectedStock.companyName}</Typography>
                  <Typography color="primary.main" variant="h6">
                    {formatCurrency(selectedStock.currentPrice)}
                  </Typography>
                </Stack>
              ) : (
                <Typography color="text.secondary">No stock selected.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default PlaceOrderPage;
