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
import AppShell from './components/layout/AppShell';
import AuthGate from './components/auth/AuthGate';
import ActorGate from './components/auth/ActorGate';
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

// Protected routes with both AuthGate and ActorGate
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <AuthGate>
      <ActorGate>
        <DashboardPage />
      </ActorGate>
    </AuthGate>
  ),
});

const benchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/benches',
  component: () => (
    <AuthGate>
      <ActorGate>
        <BenchListPage />
      </ActorGate>
    </AuthGate>
  ),
});

const newBenchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/benches/new',
  component: () => (
    <AuthGate>
      <ActorGate>
        <NewBenchPage />
      </ActorGate>
    </AuthGate>
  ),
});

const benchDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/benches/$benchId',
  component: () => (
    <AuthGate>
      <ActorGate>
        <BenchDetailPage />
      </ActorGate>
    </AuthGate>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: () => (
    <AuthGate>
      <ActorGate>
        <ProfilePage />
      </ActorGate>
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  benchesRoute,
  newBenchRoute,
  benchDetailRoute,
  profileRoute,
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
