import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import {
  PiCalculator,
  PiCalculatorFill,
  PiFolders,
  PiFoldersFill,
  PiHouse,
  PiHouseFill,
  PiShieldCheck,
  PiShieldCheckFill,
  PiSignOut,
  PiStorefront,
  PiStorefrontFill,
} from 'react-icons/pi';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../services/auth';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Badge from './ui/Badge';
import Button, { ButtonLink } from './ui/Button';

interface NavItem {
  to: string;
  label: string;
  /** Etiqueta corta para la barra inferior en móvil. */
  short?: string;
  icon: ReactNode;
  iconActive: ReactNode;
  /** Visible sin sesión. */
  public?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Inicio',
    icon: <PiHouse aria-hidden="true" />,
    iconActive: <PiHouseFill aria-hidden="true" />,
  },
  {
    to: '/calculators',
    label: 'Calculadoras',
    short: 'Calcular',
    icon: <PiCalculator aria-hidden="true" />,
    iconActive: <PiCalculatorFill aria-hidden="true" />,
    public: true,
  },
  {
    to: '/projects',
    label: 'Proyectos',
    icon: <PiFolders aria-hidden="true" />,
    iconActive: <PiFoldersFill aria-hidden="true" />,
  },
  {
    to: '/providers',
    label: 'Proveedores',
    icon: <PiStorefront aria-hidden="true" />,
    iconActive: <PiStorefrontFill aria-hidden="true" />,
    public: true,
  },
  {
    to: '/admin',
    label: 'Administración',
    short: 'Admin',
    icon: <PiShieldCheck aria-hidden="true" />,
    iconActive: <PiShieldCheckFill aria-hidden="true" />,
    adminOnly: true,
  },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function Avatar({ user, className }: { user: User; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        className
      )}
    >
      {initials(user.name)}
    </span>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!user) return item.public;
    return !item.adminOnly || user.role === 'admin';
  });
  const items: NavItem[] = user
    ? visibleItems
    : [
        {
          to: '/',
          label: 'Inicio',
          icon: <PiHouse aria-hidden="true" />,
          iconActive: <PiHouseFill aria-hidden="true" />,
        },
        ...visibleItems,
      ];
  const currentSection =
    items.find((item) => item.to !== '/' && pathname.startsWith(item.to))?.label ??
    'Tu espacio de trabajo';
  const home = user ? '/dashboard' : '/';
  // Sin sesión hay menos secciones, pero si hay más de una también va la barra inferior.
  const showBottomNav = items.length > 1;

  return (
    <div className="workspace-shell min-h-dvh bg-canvas text-ink lg:pl-[16rem] print:pl-0">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      {/* ------------------------------------------- barra lateral (escritorio) */}
      {/* `--ring`: sobre el fondo oscuro el foco usa el naranja vivo para que se distinga */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[16rem] flex-col bg-shell text-shell-fg [--ring:var(--accent)] lg:flex print:hidden">
        <div className="flex h-[4.5rem] shrink-0 items-center border-b border-shell-line px-6">
          <Logo to={home} tone="inverse" />
        </div>

        <nav aria-label="Principal" className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          <p className="px-3 pb-3 pt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-shell-muted">
            Tu espacio de trabajo
          </p>
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'group relative flex min-h-12 items-center gap-3 rounded-md px-3 py-3 text-[0.9375rem] font-medium transition-colors',
                  isActive
                    ? 'bg-shell-active text-shell-fg'
                    : 'text-shell-muted hover:bg-shell-raised hover:text-shell-fg'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent"
                    />
                  )}
                  <span
                    className={clsx(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-md [&>svg]:h-5 [&>svg]:w-5',
                      isActive ? 'bg-accent/10 text-accent' : 'bg-shell-raised'
                    )}
                  >
                    {isActive ? item.iconActive : item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-shell-line p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-shell-muted">
              Apariencia
            </span>
            <ThemeToggle tone="shell" />
          </div>

          {user ? (
            <div className="flex items-center gap-3 rounded-md bg-shell-raised p-2.5">
              <Avatar user={user} className="bg-shell-active text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-shell-fg">{user.name}</p>
                <p className="truncate text-xs text-shell-muted">
                  {user.role === 'admin' ? 'Administrador' : user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-shell-muted transition-colors hover:bg-shell-active hover:text-shell-fg"
              >
                <PiSignOut aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="rounded-md bg-shell-raised p-3">
              <p className="text-sm text-shell-muted">
                Crea una cuenta para guardar tus cálculos en proyectos.
              </p>
              <div className="mt-3 grid gap-2">
                <ButtonLink to="/register" size="sm">
                  Crear cuenta
                </ButtonLink>
                <ButtonLink to="/login" size="sm" variant="on-dark">
                  Iniciar sesión
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="sticky top-0 z-20 hidden h-[4.5rem] items-center justify-between gap-4 border-b border-line bg-surface/95 px-10 backdrop-blur-md lg:flex print:hidden">
        <p className="flex items-center gap-3 text-sm">
          <span className="text-ink-subtle">ConstruApp Nariño</span>
          <span aria-hidden="true" className="text-line-control">
            /
          </span>
          <span className="font-semibold">{currentSection}</span>
        </p>
        <ButtonLink
          to={pathname === '/calculators' ? '/providers' : '/calculators'}
          variant="secondary"
          size="sm"
          icon={
            pathname === '/calculators' ? (
              <PiStorefront aria-hidden="true" />
            ) : (
              <PiCalculator aria-hidden="true" />
            )
          }
        >
          {pathname === '/calculators' ? 'Consultar precios' : 'Calcular materiales'}
        </ButtonLink>
      </div>

      {/* ------------------------------------------------ barra superior (móvil) */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/95 px-4 backdrop-blur lg:hidden print:hidden">
        <Logo to={home} />

        {user ? (
          <Popover className="relative">
            <PopoverButton
              aria-label="Abrir menú de usuario"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line"
            >
              <Avatar user={user} className="bg-brand-soft text-brand-text" />
            </PopoverButton>
            <PopoverPanel
              transition
              anchor={{ to: 'bottom end', gap: 8 }}
              className="z-50 max-h-[calc(100dvh-5rem)] w-72 overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface p-4 shadow-overlay transition duration-150 ease-out data-[closed]:-translate-y-1 data-[closed]:opacity-0"
            >
              <div className="flex items-center gap-3">
                <Avatar user={user} className="bg-brand-soft text-brand-text" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-sm text-ink-muted">{user.email}</p>
                </div>
              </div>
              {user.role === 'admin' && (
                <Badge tone="brand" className="mt-3">
                  Administrador
                </Badge>
              )}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className="text-sm font-medium text-ink-muted">Apariencia</span>
                <ThemeToggle />
              </div>
              <Button
                variant="secondary"
                fullWidth
                className="mt-4"
                icon={<PiSignOut aria-hidden="true" />}
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </PopoverPanel>
          </Popover>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <ButtonLink to="/login" size="sm">
              Iniciar sesión
            </ButtonLink>
          </div>
        )}
      </header>

      <main
        id="contenido"
        className={clsx(
          'mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-10',
          showBottomNav ? 'pb-28' : 'pb-12'
        )}
      >
        <Outlet />
      </main>

      {/* ------------------------------------------------ barra inferior (móvil) */}
      {showBottomNav && (
        <nav
          aria-label="Principal"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden print:hidden"
        >
          <ul className="mx-auto flex max-w-lg">
            {items.map((item) => (
              <li key={item.to} className="min-w-0 flex-1">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'relative flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors',
                      isActive ? 'text-brand-text' : 'text-ink-muted hover:text-ink'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-5 top-0 h-[3px] rounded-b-full bg-brand"
                        />
                      )}
                      <span className="[&>svg]:h-6 [&>svg]:w-6">
                        {isActive ? item.iconActive : item.icon}
                      </span>
                      <span className="max-w-full truncate px-1">{item.short ?? item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
