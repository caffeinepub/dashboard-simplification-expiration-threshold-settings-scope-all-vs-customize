import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Moon, Sun, LayoutDashboard, TestTube2, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ScrollShortcuts } from '../navigation/ScrollShortcuts';
import { useI18n } from '../../i18n/useI18n';

export default function AppShell() {
  const navigate = useNavigate();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { t } = useI18n();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <img
              src="/assets/generated/safran-logo.dim_220x64.png"
              alt="Safran"
              className="h-4 w-auto object-contain flex-shrink-0"
            />
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={isActive('/') && currentPath === '/' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/' })}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                {t('nav.dashboard')}
              </Button>
              <Button
                variant={isActive('/benches') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/benches' })}
              >
                <TestTube2 className="h-4 w-4 mr-2" />
                {t('nav.testBenches')}
              </Button>
              <Button
                variant={isActive('/profile') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/profile' })}
              >
                <User className="h-4 w-4 mr-2" />
                {t('nav.profile')}
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {identity && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {t('nav.signOut')}
              </Button>
            )}
          </div>
        </div>
        <nav className="md:hidden border-t px-4 py-2 flex gap-1 overflow-x-auto">
          <Button
            variant={isActive('/') && currentPath === '/' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/' })}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            {t('nav.dashboard')}
          </Button>
          <Button
            variant={isActive('/benches') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/benches' })}
          >
            <TestTube2 className="h-4 w-4 mr-2" />
            {t('nav.testBenches')}
          </Button>
          <Button
            variant={isActive('/profile') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate({ to: '/profile' })}
          >
            <User className="h-4 w-4 mr-2" />
            {t('nav.profile')}
          </Button>
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <ScrollShortcuts />
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
