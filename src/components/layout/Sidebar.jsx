import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BarChartIcon from '@mui/icons-material/BarChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LogoutIcon from '@mui/icons-material/Logout';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import {
  Button,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { paths } from '../../routes/paths.js';

const navigationItems = [
  { label: 'Dashboard', path: paths.dashboard, icon: <DashboardIcon /> },
  { label: 'Portfolio', path: paths.portfolio, icon: <AccountBalanceWalletIcon /> },
  { label: 'Place Order', path: paths.placeOrder, icon: <SwapHorizIcon /> },
  { label: 'Orders', path: paths.orders, icon: <ReceiptLongIcon /> },
  { label: 'Trade History', path: paths.tradeHistory, icon: <HistoryIcon /> },
  { label: 'Order Book', path: paths.orderBook, icon: <LibraryBooksIcon /> },
  { label: 'Stocks', path: paths.stocks, icon: <ShowChartIcon /> },
];

function SidebarContent({ onClose }) {
  const { logout } = useAuth();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ letterSpacing: 0.2 }}>StockTrader Pro</Typography>
          <Typography color="text.secondary" variant="caption">
            Execution Workspace
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {navigationItems.map((item) => (
          <ListItemButton
            component={NavLink}
            end={item.path === paths.dashboard}
            key={item.path}
            onClick={onClose}
            to={item.path}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ px: 2, pb: 1 }}>
        <Button
          fullWidth
          color="inherit"
          onClick={logout}
          startIcon={<LogoutIcon />}
          variant="outlined"
          sx={{ justifyContent: 'flex-start' }}
        >
          Logout
        </Button>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'rgba(22, 35, 58, 0.85)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            gap: 1.5,
            p: 1.5,
          }}
        >
          <BarChartIcon color="primary" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700}>
              Session Mode
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Simulated live execution
            </Typography>
            <Box sx={{ mt: 0.75 }}>
              <Chip label="Auto Refresh" size="small" color="secondary" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Sidebar({ drawerWidth, mobileOpen, onClose }) {
  return (
    <>
      <Drawer
        ModalProps={{ keepMounted: true }}
        onClose={onClose}
        open={mobileOpen}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        variant="temporary"
      >
        <SidebarContent onClose={onClose} />
      </Drawer>
      <Drawer
        open
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        variant="permanent"
      >
        <SidebarContent />
      </Drawer>
    </>
  );
}

export default Sidebar;
