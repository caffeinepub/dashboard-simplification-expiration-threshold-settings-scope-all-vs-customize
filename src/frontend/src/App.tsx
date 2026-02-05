import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import SignInPage from './pages/SignInPage';
import BenchListPage from './pages/Benches/BenchListPage';
import BenchDetailPage from './pages/Benches/BenchDetailPage';
import NewBenchPage from './pages/Benches/NewBenchPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';
import AppShell from './components/layout/AppShell';
import AuthGate from './components/auth/AuthGate';
import AppErrorBoundary from './components/AppErrorBoundary';

// Root layout component
function RootLayout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <SignInPage />;
  }

  return (
    <AppErrorBoundary>
      <AppShell />
    </AppErrorBoundary>
  );
}

// Root route with layout
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Protected routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AuthGate>
      <DashboardPage />
    </AuthGate>
  ),
});

const benchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/benches',
  component: () => (
    <AuthGate>
      <BenchListPage />
    </AuthGate>
  ),
});

const newBenchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/benches/new',
  component: () => (
    <AuthGate>
      <NewBenchPage />
    </AuthGate>
  ),
});

const benchDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/benches/$benchId',
  component: () => (
    <AuthGate>
      <BenchDetailPage />
    </AuthGate>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <AuthGate>
      <ProfilePage />
    </AuthGate>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AuthGate>
      <AdminPage />
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  benchesRoute,
  newBenchRoute,
  benchDetailRoute,
  profileRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
