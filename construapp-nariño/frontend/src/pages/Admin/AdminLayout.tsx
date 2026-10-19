import clsx from 'clsx';
import { PiPackage, PiStorefront, PiTag, PiUsers } from 'react-icons/pi';
import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';

const tabs = [
  { to: '/admin/materials', label: 'Materiales', icon: <PiPackage aria-hidden="true" /> },
  { to: '/admin/prices', label: 'Precios', icon: <PiTag aria-hidden="true" /> },
  { to: '/admin/providers', label: 'Proveedores', icon: <PiStorefront aria-hidden="true" /> },
  { to: '/admin/users', label: 'Usuarios', icon: <PiUsers aria-hidden="true" /> },
];

export default function AdminLayout() {
  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        eyebrow="Gestión"
        title="Administración"
        description="Catálogo de materiales, precios por proveedor y moderación de usuarios."
      />

      {/* En móvil las pestañas se desplazan en horizontal hasta el borde de la pantalla */}
      <nav
        aria-label="Secciones de administración"
        className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        <ul className="flex min-w-max border-b border-line">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={({ isActive }) =>
                  clsx(
                    'relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors [&>svg]:h-5 [&>svg]:w-5',
                    isActive ? 'text-brand-text' : 'text-ink-muted hover:text-ink'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {tab.icon}
                    {tab.label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Outlet />
    </div>
  );
}
