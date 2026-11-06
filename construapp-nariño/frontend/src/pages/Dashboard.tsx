import { useQuery } from '@tanstack/react-query';
import {
  PiArrowRight,
  PiCalculator,
  PiCoins,
  PiFolders,
  PiGauge,
  PiListChecks,
  PiShieldCheck,
  PiStorefront,
} from 'react-icons/pi';
import { Link } from 'react-router-dom';
import CalculatorCatalog from '../components/calculators/CalculatorCatalog';
import ProjectCard from '../components/projects/ProjectCard';
import Alert from '../components/ui/Alert';
import Button, { ButtonLink } from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Meter, { type MeterTone } from '../components/ui/Meter';
import PageHeader from '../components/ui/PageHeader';
import Skeleton from '../components/ui/Skeleton';
import StatTile from '../components/ui/StatTile';
import { useAuth } from '../hooks/useAuth';
import { projectsApi, type ProjectListItem } from '../services/projects';
import { formatCOP, formatCOPCompact, formatPct } from '../utils/format';
import { USER_TYPE_LABEL } from '../utils/labels';

const RECENT_COUNT = 3;

/** Cifras de cabecera a partir de la lista de proyectos. */
function summarize(projects: ProjectListItem[]) {
  const budgeted = projects.filter((p) => p.summary.budget !== null);
  const totalBudget = budgeted.reduce((sum, p) => sum + (p.summary.budget ?? 0), 0);
  const budgetedCost = budgeted.reduce((sum, p) => sum + p.summary.totalCost, 0);
  const usedPct = totalBudget > 0 ? (budgetedCost / totalBudget) * 100 : null;

  let tone: MeterTone = 'info';
  if (usedPct !== null && usedPct > 100) tone = 'danger';
  else if (usedPct !== null && usedPct >= 90) tone = 'warning';

  return {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in-progress').length,
    calculations: projects.reduce((sum, p) => sum + p.summary.totalCalculations, 0),
    totalCost: projects.reduce((sum, p) => sum + p.summary.totalCost, 0),
    budgetedCount: budgeted.length,
    totalBudget,
    usedPct,
    tone,
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const projects = data?.projects ?? [];
  const stats = summarize(projects);
  const recent = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, RECENT_COUNT);

  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="animate-rise space-y-8">
      <PageHeader
        eyebrow={today}
        title={`Hola, ${user?.name?.split(' ')[0] ?? 'bienvenido'}`}
        description={
          <>
            {USER_TYPE_LABEL[user?.userType ?? ''] ?? user?.userType} · {user?.email}
          </>
        }
        actions={
          <ButtonLink to="/calculators" icon={<PiCalculator aria-hidden="true" />}>
            Nuevo cálculo
          </ButtonLink>
        }
      />

      <section aria-labelledby="inicio-siguiente-paso" className="workspace-banner">
        <div
          aria-hidden="true"
          className="dark blueprint pointer-events-none absolute inset-y-0 right-0 w-2/3 opacity-50 [mask-image:linear-gradient(to_right,transparent,black)]"
        />
        <div className="relative flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-accent">
              Planea antes de comprar
            </p>
            <h2
              id="inicio-siguiente-paso"
              className="mt-2 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl"
            >
              Un buen cálculo es un buen comienzo.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-shell-muted">
              Elige qué vas a construir y reúne tus materiales con un presupuesto más claro.
            </p>
          </div>
          <ButtonLink
            to="/providers"
            variant="on-dark"
            icon={<PiStorefront aria-hidden="true" />}
            className="w-fit shrink-0"
          >
            Consultar precios publicados
          </ButtonLink>
        </div>
      </section>

      {/* ------------------------------------------------------------ cifras */}
      <section aria-label="Resumen de tus proyectos">
        {isError ? (
          <Alert
            tone="danger"
            title="No se pudo cargar el resumen"
            action={
              <Button variant="secondary" size="sm" onClick={() => refetch()}>
                Reintentar
              </Button>
            }
          >
            Revisa tu conexión e inténtalo de nuevo.
          </Alert>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" role="status">
            <span className="sr-only">Cargando resumen…</span>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="card p-4 sm:p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-8 w-32" />
                <Skeleton className="mt-3 h-4 w-28" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatTile
              label="Proyectos"
              value={stats.total}
              caption={`${stats.inProgress} en progreso`}
              icon={<PiFolders />}
            />
            <StatTile
              label="Cálculos guardados"
              value={stats.calculations}
              caption="En todos tus proyectos"
              icon={<PiListChecks />}
            />
            <StatTile
              label="Costo estimado"
              value={formatCOPCompact(stats.totalCost)}
              title={formatCOP(stats.totalCost)}
              caption="Suma de tus proyectos"
              icon={<PiCoins />}
            />
            <StatTile
              label="Presupuesto usado"
              value={stats.usedPct !== null ? formatPct(stats.usedPct) : '—'}
              caption={
                stats.usedPct !== null
                  ? `De ${formatCOPCompact(stats.totalBudget)} en ${stats.budgetedCount} proyecto${stats.budgetedCount === 1 ? '' : 's'}`
                  : 'Ningún proyecto tiene presupuesto objetivo'
              }
              icon={<PiGauge />}
            >
              {stats.usedPct !== null && (
                <Meter
                  value={stats.usedPct}
                  tone={stats.tone}
                  label="Presupuesto usado"
                  valueText={`${formatPct(stats.usedPct)} del presupuesto total`}
                  className="mt-3"
                />
              )}
            </StatTile>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------ calculadoras */}
      <section aria-labelledby="inicio-calculadoras">
        <h2 id="inicio-calculadoras" className="title-section">
          Calcular materiales
        </h2>
        <div className="mt-3">
          <CalculatorCatalog compact />
        </div>
      </section>

      {/* ------------------------------------------------ proyectos recientes */}
      <section aria-labelledby="inicio-proyectos">
        <div className="flex items-end justify-between gap-4">
          <h2 id="inicio-proyectos" className="title-section">
            Proyectos recientes
          </h2>
          {projects.length > 0 && (
            <Link to="/projects" className="link text-sm">
              Ver todos
            </Link>
          )}
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" role="status">
              <span className="sr-only">Cargando proyectos…</span>
              {Array.from({ length: RECENT_COUNT }, (_, i) => (
                <Skeleton key={i} className="h-44 rounded-lg" />
              ))}
            </div>
          ) : recent.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recent.map((project) => (
                <ProjectCard key={project.id} project={project} titleAs="h3" />
              ))}
            </div>
          ) : (
            !isError && (
              <EmptyState
                icon={<PiFolders />}
                title="Aún no tienes proyectos"
                description="Crea un proyecto por cada obra para agrupar tus cálculos y seguir el presupuesto."
                action={<ButtonLink to="/projects">Crear mi primer proyecto</ButtonLink>}
              />
            )
          )}
        </div>
      </section>

      {user?.role === 'admin' && (
        <Link to="/admin" className="card card-interactive group flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-strong text-ink-muted [&>svg]:h-6 [&>svg]:w-6">
            <PiShieldCheck aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">Panel de administración</span>
            <span className="block text-sm text-ink-muted">
              Catálogo de materiales, precios por proveedor y moderación de usuarios.
            </span>
          </span>
          <PiArrowRight
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-ink-subtle transition group-hover:translate-x-0.5 group-hover:text-brand-text"
          />
        </Link>
      )}
    </div>
  );
}
