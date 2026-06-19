import { Box, Toolbar, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';

const drawerWidth = 264;

function DashboardLayout() {
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setMobileOpen((open) => !open);
  };

  const handleCloseSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar
        drawerWidth={drawerWidth}
        onMenuClick={handleToggleSidebar}
      />
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onClose={handleCloseSidebar}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: 'background.default',
          ml: { lg: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            px: { xs: 2, sm: 3.5, md: 4 },
            py: { xs: 2, sm: 3, md: 3.5 },
            maxWidth: isDesktop ? 1520 : '100%',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
