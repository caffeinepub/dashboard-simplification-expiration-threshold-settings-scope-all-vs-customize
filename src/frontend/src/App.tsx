import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/layout/AppShell';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import { BenchListPage } from './pages/Benches/BenchListPage';
import { BenchDetailPage } from './pages/Benches/BenchDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';
import AuthGate from './components/auth/AuthGate';
import ActorGate from './components/auth/ActorGate';
import AdminGate from './components/admin/AdminGate';
import { I18nProvider } from './i18n/I18nProvider';
import AppErrorBoundary from './components/AppErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected layout with auth and actor gates
function ProtectedLayout() {
  return (
    <AuthGate>
      <ActorGate>
        <AppShell>
          <Outlet />
        </AppShell>
      </ActorGate>
    </AuthGate>
  );
}

// Root route for public pages (sign-in)
const publicRootRoute = createRootRoute({
  component: Outlet,
});

const signInRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/sign-in',
  component: SignInPage,
});

// Root route for protected pages
const protectedRootRoute = createRootRoute({
  component: ProtectedLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => protectedRootRoute,
  path: '/',
  component: DashboardPage,
});

const benchesRoute = createRoute({
  getParentRoute: () => protectedRootRoute,
  path: '/benches',
  component: BenchListPage,
});

const benchDetailRoute = createRoute({
  getParentRoute: () => protectedRootRoute,
  path: '/benches/$benchId',
  component: BenchDetailPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRootRoute,
  path: '/profile',
  component: ProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => protectedRootRoute,
  path: '/admin',
  component: () => (
    <AdminGate>
      <AdminPage />
    </AdminGate>
  ),
});

// Create separate route trees
const publicRouteTree = publicRootRoute.addChildren([signInRoute]);
const protectedRouteTree = protectedRootRoute.addChildren([
  indexRoute,
  benchesRoute,
  benchDetailRoute,
  profileRoute,
  adminRoute,
]);

// Combine both trees by creating a unified router
// We'll use the protected tree as the main tree and handle sign-in separately
const router = createRouter({ 
  routeTree: protectedRouteTree,
  defaultNotFoundComponent: () => {
    // Redirect to sign-in if route not found
    window.location.href = '/sign-in';
    return null;
  },
});

const signInRouter = createRouter({ routeTree: publicRouteTree });

export default function App() {
  // Determine which router to use based on current path
  const isSignInPage = window.location.pathname === '/sign-in';

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <I18nProvider>
            <RouterProvider router={isSignInPage ? signInRouter : router} />
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}
