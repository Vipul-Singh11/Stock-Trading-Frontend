import { Box, Card, CardContent, Typography } from '@mui/material';

function PlaceholderPanel({ title, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.25 }}>
        <Typography
          variant="overline"
          sx={{
            display: 'block',
            color: 'text.secondary',
            letterSpacing: 1,
            mb: 0.75,
          }}
        >
          {title}
        </Typography>
        <Box color="text.secondary">{children}</Box>
      </CardContent>
    </Card>
  );
}

export default PlaceholderPanel;
