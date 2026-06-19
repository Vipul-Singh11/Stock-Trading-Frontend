import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import PriceLineChart from '../components/charts/PriceLineChart.jsx';
import MiniSparkline from '../components/charts/MiniSparkline.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { getStocks } from '../services/stockService.js';
import { formatCurrency, getApiErrorMessage } from '../utils/formatters.js';
import { generateMockPriceHistory } from '../utils/mockPriceHistory.js';

function StocksPage() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadStocks() {
      setIsLoading(true);
      setError('');

      try {
        const data = await getStocks();

        if (mounted) {
          setStocks(data || []);
          setSelectedSymbol(data?.[0]?.symbol || '');
        }
      } catch (loadError) {
        if (mounted) {
          setError(getApiErrorMessage(loadError, 'Unable to load stocks'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadStocks();

    return () => {
      mounted = false;
    };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredStocks = stocks.filter((stock) => {
    if (!normalizedSearch) {
      return true;
    }

    return (
      stock.symbol?.toLowerCase().includes(normalizedSearch)
      || stock.companyName?.toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (sortBy === 'price') {
      return ((Number(a.currentPrice) || 0) - (Number(b.currentPrice) || 0)) * direction;
    }

    return String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')) * direction;
  });

  const selectedStock = stocks.find((stock) => stock.symbol === selectedSymbol) || stocks[0];
  const selectedChartData = selectedStock
    ? generateMockPriceHistory({
      symbol: selectedStock.symbol,
      currentPrice: Number(selectedStock.currentPrice),
      points: 40,
      intervalMinutes: 15,
    })
    : [];

  return (
    <>
      <PageHeader
        title="Stocks"
        subtitle="Market watch, fast search, and trend intelligence for each listed symbol."
      />
      {error ? <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert> : null}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Search stocks"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Symbol or company"
                value={search}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3.5}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  label="Sort By"
                  onChange={(event) => setSortBy(event.target.value)}
                  value={sortBy}
                >
                  <MenuItem value="symbol">Symbol</MenuItem>
                  <MenuItem value="companyName">Company</MenuItem>
                  <MenuItem value="price">Current Price</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3.5}>
              <FormControl fullWidth>
                <InputLabel>Direction</InputLabel>
                <Select
                  label="Direction"
                  onChange={(event) => setSortDirection(event.target.value)}
                  value={sortDirection}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {selectedStock ? (
            <Paper sx={{ p: 2.25 }}>
              <PriceLineChart
                data={selectedChartData}
                title={`${selectedStock.symbol} Price Trend`}
                subtitle={`${selectedStock.companyName} - generated intraday demo series connected to current price`}
                lineColor="#00c2a8"
                height={300}
              />
            </Paper>
          ) : null}

          <Grid container spacing={2}>
            {sortedStocks.slice(0, 8).map((stock) => {
              const sparkline = generateMockPriceHistory({
                symbol: stock.symbol,
                currentPrice: Number(stock.currentPrice),
                points: 20,
                intervalMinutes: 20,
              });

              return (
                <Grid item xs={12} sm={6} lg={3} key={stock.symbol}>
                  <Card
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedSymbol(stock.symbol)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="h6">{stock.symbol}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {stock.companyName}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1 }} color="primary.main">
                        {formatCurrency(stock.currentPrice)}
                      </Typography>
                      <Box sx={{ mt: 1.25 }}>
                        <MiniSparkline data={sparkline} color="#4aa3ff" />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stock Symbol</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedStocks.map((stock) => (
                  <TableRow
                    key={stock.symbol}
                    hover
                    onClick={() => setSelectedSymbol(stock.symbol)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell><Typography fontWeight={700}>{stock.symbol}</Typography></TableCell>
                    <TableCell>{stock.companyName}</TableCell>
                    <TableCell align="right">{formatCurrency(stock.currentPrice)}</TableCell>
                  </TableRow>
                ))}
                {!sortedStocks.length ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography color="text.secondary" textAlign="center">No stocks match your filters.</Typography>
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

export default StocksPage;
