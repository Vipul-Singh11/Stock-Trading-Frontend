import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { paths } from '../routes/paths.js';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authError, isAuthenticated, register } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to={paths.dashboard} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register({ username, email, password });
      navigate(paths.dashboard, { replace: true });
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: 'background.default',
        display: 'flex',
        minHeight: '100vh',
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Stack alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonAddAltIcon />
            </Avatar>
            <Box textAlign="center">
              <Typography variant="h5">Create account</Typography>
              <Typography color="text.secondary" variant="body2">
                Registration will connect to User Service after approval.
              </Typography>
            </Box>
          </Stack>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                autoComplete="username"
                fullWidth
                label="Username"
                onChange={(event) => setUsername(event.target.value)}
                required
                value={username}
              />
              <TextField
                autoComplete="email"
                fullWidth
                label="Email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              <TextField
                autoComplete="new-password"
                fullWidth
                label="Password"
                helperText="Minimum 6 characters"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              {(error || authError) ? (
                <Alert severity="error">{error || authError}</Alert>
              ) : null}
              <Button
                disabled={isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
              >
                Create account
              </Button>
              <Typography align="center" color="text.secondary" variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to={paths.login} underline="hover">
                  Sign in
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegisterPage;
