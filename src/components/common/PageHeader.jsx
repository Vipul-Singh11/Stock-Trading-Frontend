import { Box, Typography } from '@mui/material';

function PageHeader({ title, subtitle, action }) {
  return (
    <Box
      sx={{
        alignItems: { xs: 'flex-start', sm: 'center' },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        justifyContent: 'space-between',
        mb: 3.5,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ letterSpacing: 0.2 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography color="text.secondary" sx={{ mt: 0.6 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}

export default PageHeader;
