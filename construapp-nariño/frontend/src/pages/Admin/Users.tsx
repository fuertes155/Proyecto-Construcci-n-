import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCheckCircleFill, PiMagnifyingGlass, PiProhibit } from 'react-icons/pi';
import Alert from '../../components/ui/Alert';
import Badge, { type BadgeTone } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../hooks/useAuth';
import { adminApi, type AdminUser } from '../../services/admin';
import { apiErrorMessage } from '../../services/api';
import { ROLE_LABEL, USER_TYPE_LABEL } from '../../utils/labels';

const ROLE_TONE: Record<AdminUser['role'], BadgeTone> = {
  admin: 'brand',
  provider: 'info',
  user: 'neutral',
};

const fullName = (u: AdminUser) => [u.firstName, u.lastName].filter(Boolean).join(' ');

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [toSuspend, setToSuspend] = useState<AdminUser | null>(null);
  const queryClient = useQueryClient();

  // Evita disparar una petición por cada tecla escrita en el buscador.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(id);
  }, [q]);

  const { data, isLoading, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: ['admin', 'users', status, role, debouncedQ],
    queryFn: () =>
      adminApi.users.list({
        status: status || undefined,
        role: role || undefined,
        q: debouncedQ || undefined,
      }),
    // Al filtrar o buscar se mantiene la tabla anterior (atenuada) en vez de vaciarla.
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: 'active' | 'suspended' }) =>
      adminApi.users.setStatus(id, next),
    onSuccess: () => {
      toast.success('Estado actualizado');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo actualizar el estado')),
    onSettled: () => setToSuspend(null),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="title-section">Usuarios</h2>
        {data && (
          <p className="text-sm text-ink-muted">
            {data.total} usuario{data.total === 1 ? '' : 's'}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full sm:w-80">
          <PiMagnifyingGlass
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-subtle"
          />
          <input
            type="search"
            aria-label="Buscar usuarios"
            className="input pl-10"
            placeholder="Buscar por correo o nombre…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          aria-label="Filtrar por estado"
          className="input w-full sm:w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="suspended">Suspendido</option>
        </select>
        <select
          aria-label="Filtrar por rol"
          className="input w-full sm:w-auto"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="provider">Proveedor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading && <TableSkeleton label="Cargando usuarios…" />}
      {isError && (
        <Alert
          tone="danger"
          title="No se pudieron cargar los usuarios"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        />
      )}

      {data && (
        <div
          className={clsx(
            'card overflow-hidden transition-opacity',
            isPlaceholderData && 'opacity-60'
          )}
        >
          <div className="overflow-x-auto">
            {/* En móvil el tipo, el rol y el estado pasan bajo el nombre */}
            <table className="data-table md:min-w-[44rem]">
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col" className="hidden md:table-cell">
                    Tipo
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Rol
                  </th>
                  <th scope="col" className="hidden md:table-cell">
                    Estado
                  </th>
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => {
                  const userType = USER_TYPE_LABEL[u.userType] ?? u.userType;
                  const roleBadge = (
                    <Badge tone={ROLE_TONE[u.role] ?? 'neutral'}>{ROLE_LABEL[u.role] ?? u.role}</Badge>
                  );
                  const statusBadge =
                    u.status === 'active' ? (
                      <Badge tone="success" icon={<PiCheckCircleFill aria-hidden="true" />}>
                        Activo
                      </Badge>
                    ) : (
                      <Badge tone="danger" icon={<PiProhibit aria-hidden="true" />}>
                        Suspendido
                      </Badge>
                    );
                  return (
                    <tr key={u.id}>
                      <td>
                        <p className="font-semibold">{fullName(u)}</p>
                        <p className="mt-0.5 break-all text-xs text-ink-subtle">{u.email}</p>
                        <p className="mt-1 text-xs text-ink-muted md:hidden">{userType}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5 md:hidden">
                          {roleBadge}
                          {statusBadge}
                        </div>
                      </td>
                      <td className="hidden whitespace-nowrap text-ink-muted md:table-cell">
                        {userType}
                      </td>
                      <td className="hidden md:table-cell">{roleBadge}</td>
                      <td className="hidden md:table-cell">{statusBadge}</td>
                      <td className="w-px whitespace-nowrap py-1 text-right">
                        {u.id === me?.id ? (
                          <span className="px-3 text-sm text-ink-subtle">Tu cuenta</span>
                        ) : u.status === 'active' ? (
                          <Button
                            variant="danger-ghost"
                            size="sm"
                            disabled={statusMutation.isPending}
                            onClick={() => setToSuspend(u)}
                          >
                            Suspender
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={statusMutation.isPending}
                            onClick={() => statusMutation.mutate({ id: u.id, next: 'active' })}
                          >
                            Reactivar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {data.users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-ink-muted">
                      No hay usuarios con este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toSuspend !== null}
        title="¿Suspender esta cuenta?"
        description={
          toSuspend && (
            <>
              <strong className="font-semibold text-ink">{fullName(toSuspend)}</strong> (
              {toSuspend.email}) no podrá iniciar sesión y se cerrarán sus sesiones abiertas.
              Puedes reactivar la cuenta cuando quieras.
            </>
          )
        }
        confirmLabel="Suspender cuenta"
        loading={statusMutation.isPending}
        onConfirm={() => toSuspend && statusMutation.mutate({ id: toSuspend.id, next: 'suspended' })}
        onCancel={() => setToSuspend(null)}
      />
    </div>
  );
}
