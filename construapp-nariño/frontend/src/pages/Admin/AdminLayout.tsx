import clsx from 'clsx';
import { PiPackage, PiShieldCheck, PiStorefront, PiTag, PiUsers } from 'react-icons/pi';
import { NavLink, Outlet } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';

const tabs = [
  {
    to: '/admin/materials',
    label: 'Materiales',
    caption: 'Catálogo y unidades',
    icon: <PiPackage aria-hidden="true" />,
  },
  {
    to: '/admin/prices',
    label: 'Precios',
    caption: 'Valores y fuentes',
    icon: <PiTag aria-hidden="true" />,
  },
  {
    to: '/admin/providers',
    label: 'Proveedores',
    caption: 'Directorio comercial',
    icon: <PiStorefront aria-hidden="true" />,
  },
  {
    to: '/admin/users',
    label: 'Usuarios',
    caption: 'Cuentas y acceso',
    icon: <PiUsers aria-hidden="true" />,
  },
];

export default function AdminLayout() {
  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        eyebrow="Gestión"
        title="Administración"
        description="Catálogo de materiales, precios por proveedor y moderación de usuarios."
        actions={
          <Badge tone="neutral" icon={<PiShieldCheck aria-hidden="true" />}>
            Solo administración
          </Badge>
        }
      />

      <nav aria-label="Secciones de administración">
        <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                className={({ isActive }) =>
                  clsx(
                    'relative flex h-full items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition-colors sm:p-4',
                    isActive
                      ? 'border-brand/30 bg-brand-soft text-brand-text'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:bg-surface-muted hover:text-ink'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={clsx(
                        'hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex [&>svg]:h-5 [&>svg]:w-5',
                        isActive ? 'bg-surface/70' : 'bg-surface-muted'
                      )}
                    >
                      {tab.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block">{tab.label}</span>
                      <span className="mt-0.5 block text-[0.6875rem] font-normal leading-relaxed text-ink-muted">
                        {tab.caption}
                      </span>
                    </span>
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
