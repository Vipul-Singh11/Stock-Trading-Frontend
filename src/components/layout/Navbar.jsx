import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {
  Avatar,
  AppBar,
  Chip,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext.jsx';

function Navbar({ drawerWidth, onMenuClick }) {
  const { logout, user } = useAuth();

  return (
    <AppBar
      color="inherit"
      elevation={0}
      position="fixed"
      sx={{
        borderBottom: '1px solid rgba(138, 167, 216, 0.2)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(10, 15, 26, 0.78)',
        width: { lg: `calc(100% - ${drawerWidth}px)` },
        ml: { lg: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          aria-label="Open navigation"
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { lg: 'none' }, mr: 1 }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            Pulse Trader Console
          </Typography>
          <Typography color="text.secondary" variant="body2" noWrap>
            Real-time simulation dashboard
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Chip
            color="primary"
            size="small"
            label="LIMIT ORDERS"
            sx={{ fontWeight: 700, display: { xs: 'none', md: 'inline-flex' } }}
          />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.dark', width: 32, height: 32 }}>
              <PersonOutlineIcon fontSize="small" />
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {user?.username || 'Trader'}
              </Typography>
              <Typography color="text.secondary" variant="caption" noWrap>
                {user?.email || 'Signed in'}
              </Typography>
            </Box>
          </Stack>
          <Button
            color="inherit"
            onClick={logout}
            startIcon={<LogoutIcon />}
            sx={{ borderColor: 'divider' }}
          >
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
