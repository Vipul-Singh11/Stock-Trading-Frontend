import { Line, LineChart, ResponsiveContainer } from 'recharts';

function MiniSparkline({ data, color = '#00c2a8', dataKey = 'price' }) {
  return (
    <ResponsiveContainer width="100%" height={64}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MiniSparkline;
