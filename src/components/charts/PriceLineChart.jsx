import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Box, Typography } from '@mui/material';

function PriceLineChart({
  data,
  title,
  subtitle,
  lineColor = '#00c2a8',
  dataKey = 'price',
  xKey = 'time',
  height = 320,
}) {
  return (
    <Box>
      {title ? (
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
      ) : null}
      {subtitle ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {subtitle}
        </Typography>
      ) : null}
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 150, 196, 0.2)" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: '#9aa9c3', fontSize: 12 }}
              axisLine={{ stroke: '#2a3b5d' }}
              tickLine={{ stroke: '#2a3b5d' }}
            />
            <YAxis
              tick={{ fill: '#9aa9c3', fontSize: 12 }}
              axisLine={{ stroke: '#2a3b5d' }}
              tickLine={{ stroke: '#2a3b5d' }}
              domain={['auto', 'auto']}
              width={56}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111a2b',
                borderColor: '#2a3b5d',
                borderRadius: 10,
                color: '#e7edf7',
              }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={lineColor}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default PriceLineChart;
