import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

function WalletTransactionDialog({
  amount,
  amountError,
  confirmColor,
  confirmLabel,
  description,
  error,
  isSubmitting,
  onAmountChange,
  onClose,
  onSubmit,
  open,
  title,
}) {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={isSubmitting ? undefined : onClose}
      open={open}
    >
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Typography color="text.secondary" variant="body2">
              {description}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              helperText={amountError || 'Enter a positive amount in USD.'}
              inputProps={{ min: 0.01, step: 0.01, inputMode: 'decimal' }}
              label="Amount"
              onChange={(event) => onAmountChange(event.target.value)}
              required
              type="number"
              value={amount}
              error={Boolean(amountError)}
            />
            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting} variant="outlined">
            Cancel
          </Button>
          <Button
            color={confirmColor}
            disabled={isSubmitting}
            type="submit"
            variant="contained"
          >
            {isSubmitting ? 'Processing...' : confirmLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default WalletTransactionDialog;