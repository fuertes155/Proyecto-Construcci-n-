import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { PiCalculator, PiCurrencyDollar, PiFolders, PiPlus } from 'react-icons/pi';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import { STATUS_LABEL } from '../components/projects/StatusBadge';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import SearchInput from '../components/ui/SearchInput';
import StatTile from '../components/ui/StatTile';
import { formatCOP, formatCOPCompact } from '../utils/format';
import { matchesSearch } from '../utils/search';
import { apiErrorMessage } from '../services/api';
import { projectsApi, type CreateProjectInput, type ProjectStatus } from '../services/projects';

type StatusFilter = 'all' | ProjectStatus;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'planning', label: STATUS_LABEL.planning },
  { value: 'in-progress', label: STATUS_LABEL['in-progress'] },
  { value: 'finished', label: STATUS_LABEL.finished },
];

export default function Projects() {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updated');
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => {
      toast.success('Proyecto creado');
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo crear el proyecto')),
  });

  const projects = data?.projects ?? [];
  const visible = projects
    .filter(
      (project) =>
        (filter === 'all' || project.status === filter) &&
        matchesSearch(`${project.name} ${project.location ?? ''}`, search)
    )
    .sort((a, b) =>
      sort === 'name'
        ? a.name.localeCompare(b.name, 'es')
        : Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    );
  const totalCost = projects.reduce((total, project) => total + project.summary.totalCost, 0);
  const totalCalculations = projects.reduce(
    (total, project) => total + project.summary.totalCalculations,
    0
  );
  const countFor = (value: StatusFilter) =>
    value === 'all' ? projects.length : projects.filter((p) => p.status === value).length;

  return (
    <div className="animate-rise space-y-6">
      <PageHeader
        eyebrow="Tus obras"
        title="Proyectos"
        description="Agrupa tus cálculos y sigue el presupuesto de cada obra."
        actions={
          <Button icon={<PiPlus aria-hidden="true" />} onClick={() => setShowForm(true)}>
            Nuevo proyecto
          </Button>
        }
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Nuevo proyecto"
        description="Agrupa los cálculos de una obra y define su presupuesto objetivo."
      >
        <ProjectForm
          submitting={createMutation.isPending}
          onCancel={() => setShowForm(false)}
          onSubmit={(input) => createMutation.mutate(input)}
        />
      </Modal>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" role="status">
          <span className="sr-only">Cargando proyectos…</span>
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <Alert
          tone="danger"
          title="No se pudieron cargar los proyectos"
          action={
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        >
          Revisa tu conexión e inténtalo de nuevo.
        </Alert>
      )}

      {data && data.total === 0 && (
        <EmptyState
          icon={<PiFolders />}
          title="Aún no hay proyectos"
          description="Crea un proyecto por cada obra. Aquí aparecerán sus cálculos y cómo va frente al presupuesto."
          action={
            <Button icon={<PiPlus aria-hidden="true" />} onClick={() => setShowForm(true)}>
              Crear mi primer proyecto
            </Button>
          }
        />
      )}

      {data && data.total > 0 && (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] gap-2 sm:grid-cols-3 sm:gap-3">
            <StatTile
              label="Obras organizadas"
              compactOnMobile
              value={projects.length}
              caption={`${countFor('in-progress')} en progreso`}
              icon={<PiFolders />}
            />
            <StatTile
              label="Costo estimado total"
              compactOnMobile
              value={formatCOPCompact(totalCost)}
              title={formatCOP(totalCost)}
              caption="Suma de los cálculos de tus proyectos"
              icon={<PiCurrencyDollar />}
            />
            <StatTile
              label="Cálculos guardados"
              compactOnMobile
              value={totalCalculations}
              caption="Materiales y cantidades por obra"
              icon={<PiCalculator />}
            />
          </div>

          <div className="filter-bar">
            <div className="flex flex-col gap-3 sm:flex-row">
              <SearchInput
                label="Buscar proyectos"
                value={search}
                onChange={setSearch}
                placeholder="Buscar por nombre o ubicación…"
                className="flex-1"
              />
              <select
                aria-label="Ordenar proyectos"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="input sm:w-56"
              >
                <option value="updated">Última actualización</option>
                <option value="name">Nombre: A a Z</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
              {FILTERS.map((f) => {
                const active = filter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(f.value)}
                    className={clsx(
                      'inline-flex min-h-11 items-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition',
                      active
                        ? 'border-brand/25 bg-brand-soft text-brand-text'
                        : 'border-line-strong bg-surface text-ink-muted hover:border-line-control hover:text-ink'
                    )}
                  >
                    {f.label}
                    <span
                      className={clsx(
                        'tabular-nums',
                        active ? 'text-brand-text' : 'text-ink-subtle'
                      )}
                    >
                      {countFor(f.value)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-ink-subtle" role="status">
              {visible.length} de {projects.length} proyectos
            </p>
          </div>

          {visible.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<PiFolders />}
              title="No encontramos proyectos"
              description="Prueba otro nombre, ubicación o estado de la obra."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setFilter('all');
                  }}
                >
                  Limpiar filtros
                </Button>
              }
            />
          )}
        </>
      )}
    </div>
  );
}
