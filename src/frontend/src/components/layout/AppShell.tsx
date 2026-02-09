import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, LogOut, User, Home, Package, Heart } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useI18n } from '../../i18n/useI18n';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useI18n();

  const handleSignOut = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/sign-in' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/assets/generated/safran-logo.dim_220x64.png"
                alt="Safran"
                className="h-4 w-auto object-contain flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
            <Link
              to="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              activeProps={{ className: 'text-foreground' }}
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              to="/benches"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              activeProps={{ className: 'text-foreground' }}
            >
              {t('nav.benches')}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate({ to: '/' })}>
                  <Home className="mr-2 h-4 w-4" />
                  {t('nav.dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/benches' })}>
                  <Package className="mr-2 h-4 w-4" />
                  {t('nav.benches')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  <User className="mr-2 h-4 w-4" />
                  {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t('footer.copyright')} {t('footer.builtWith')} <Heart className="inline h-3 w-3 text-red-500" fill="currentColor" /> {t('footer.using')}{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              caffeine.ai
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
