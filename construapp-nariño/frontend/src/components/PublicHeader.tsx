import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { PiArrowUpRight, PiList, PiX } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { ButtonLink } from './ui/Button';

const links = [
  { to: '/calculators', label: 'Calculadoras' },
  { to: '/providers', label: 'Materiales y precios' },
  { to: '/#como-funciona', label: 'Cómo funciona' },
];

export default function PublicHeader() {
  return (
    <header className="public-header">
      <div className="site-container flex h-[4.75rem] items-center justify-between gap-4">
        <Logo to="/" />
        <nav
          aria-label="Principal"
          className="hidden items-center gap-7 text-sm font-semibold text-ink-muted lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded py-2 transition-colors hover:text-brand-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden xl:inline-flex" />
          <ButtonLink to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Iniciar sesión
          </ButtonLink>
          <ButtonLink
            to="/register"
            size="sm"
            className="hidden sm:inline-flex"
            iconRight={<PiArrowUpRight aria-hidden="true" />}
          >
            Crear cuenta
          </ButtonLink>
          <Popover className="lg:hidden">
            {({ open, close }) => (
              <>
                <PopoverButton
                  className="icon-btn border border-line"
                  aria-label={open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                >
                  {open ? <PiX aria-hidden="true" /> : <PiList aria-hidden="true" />}
                </PopoverButton>
                <PopoverPanel
                  transition
                  className="absolute inset-x-4 top-full z-50 mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-xl border border-line bg-surface p-4 shadow-overlay transition duration-150 data-[closed]:-translate-y-1 data-[closed]:opacity-0 sm:left-auto sm:right-6 sm:w-80"
                >
                  <nav aria-label="Navegación móvil" className="space-y-1">
                    {links.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => close()}
                        className="flex min-h-12 items-center justify-between rounded-md px-3 font-semibold hover:bg-surface-muted"
                      >
                        {link.label}
                        <PiArrowUpRight aria-hidden="true" className="h-4 w-4 text-ink-subtle" />
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-sm text-ink-muted">Apariencia</span>
                    <ThemeToggle />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <ButtonLink to="/login" variant="secondary" size="sm" onClick={() => close()}>
                      Iniciar sesión
                    </ButtonLink>
                    <ButtonLink to="/register" size="sm" onClick={() => close()}>
                      Crear cuenta
                    </ButtonLink>
                  </div>
                </PopoverPanel>
              </>
            )}
          </Popover>
        </div>
      </div>
    </header>
  );
}
