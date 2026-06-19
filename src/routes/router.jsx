import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import OrderBookPage from '../pages/OrderBookPage.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import PlaceOrderPage from '../pages/PlaceOrderPage.jsx';
import PortfolioPage from '../pages/PortfolioPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import StocksPage from '../pages/StocksPage.jsx';
import TradeHistoryPage from '../pages/TradeHistoryPage.jsx';
import { paths } from './paths.js';

const router = createBrowserRouter([
  {
    path: paths.login,
    element: <LoginPage />,
  },
  {
    path: paths.register,
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: paths.dashboard,
            element: <DashboardPage />,
          },
          {
            path: paths.portfolio,
            element: <PortfolioPage />,
          },
          {
            path: paths.placeOrder,
            element: <PlaceOrderPage />,
          },
          {
            path: paths.orders,
            element: <OrdersPage />,
          },
          {
            path: paths.tradeHistory,
            element: <TradeHistoryPage />,
          },
          {
            path: paths.orderBook,
            element: <OrderBookPage />,
          },
          {
            path: paths.stocks,
            element: <StocksPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={paths.dashboard} replace />,
  },
]);

export default router;
