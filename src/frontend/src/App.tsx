import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/layout/AppShell';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import BenchListPage from './pages/Benches/BenchListPage';
import BenchDetailPage from './pages/Benches/BenchDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/Admin/AdminPage';
import AuthGate from './components/auth/AuthGate';
import ActorGate from './components/auth/ActorGate';
import AdminGate from './components/admin/AdminGate';
import { I18nProvider } from './i18n/I18nProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayout() {
  return (
    <AuthGate>
      <ActorGate>
        <AppShell />
      </ActorGate>
    </AuthGate>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const benchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/benches',
  component: BenchListPage,
});

const benchDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/benches/$benchId',
  component: BenchDetailPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminGate>
      <AdminPage />
    </AdminGate>
  ),
});

const signInRoute = createRoute({
  getParentRoute: () => createRootRoute({ component: Outlet }),
  path: '/sign-in',
  component: SignInPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  benchesRoute,
  benchDetailRoute,
  profileRoute,
  adminRoute,
]);

const signInRouteTree = createRootRoute({ component: Outlet }).addChildren([signInRoute]);

const router = createRouter({ routeTree });
const signInRouter = createRouter({ routeTree: signInRouteTree });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <RouterProvider router={router} />
          <Toaster />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
