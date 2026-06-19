import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingFlatRoundedIcon from '@mui/icons-material/TrendingFlatRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';

function getTrendIcon(trend) {
  if (trend > 0) {
    return <TrendingUpRoundedIcon fontSize="small" />;
  }

  if (trend < 0) {
    return <TrendingDownRoundedIcon fontSize="small" />;
  }

  return <TrendingFlatRoundedIcon fontSize="small" />;
}

function getTrendColor(trend) {
  if (trend > 0) {
    return 'success';
  }

  if (trend < 0) {
    return 'error';
  }

  return 'default';
}

function MetricCard({ title, value, subtitle, trend = 0, trendLabel }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={1.25}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ lineHeight: 1.15 }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
            {trendLabel ? (
              <Chip
                color={getTrendColor(trend)}
                icon={getTrendIcon(trend)}
                label={trendLabel}
                size="small"
                variant="outlined"
              />
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
