import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Fragment, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiArrowLeft,
  PiCalendarBlank,
  PiCaretDown,
  PiFolders,
  PiListChecks,
  PiMapPin,
  PiPencilSimple,
  PiPlus,
  PiTrash,
} from 'react-icons/pi';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CALCULATOR_META } from '../components/calculators/calculatorMeta';
import BudgetSummary from '../components/projects/BudgetSummary';
import EditProjectForm from '../components/projects/EditProjectForm';
import PurchaseList from '../components/projects/PurchaseList';
import { STATUS_LABEL } from '../components/projects/StatusBadge';
import Button, { ButtonLink, IconButton } from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import SegmentedControl, { type SegmentedOption } from '../components/ui/SegmentedControl';
import Skeleton from '../components/ui/Skeleton';
import { apiErrorMessage } from '../services/api';
import { projectsApi, type ProjectCalculation, type ProjectStatus } from '../services/projects';
import { formatCOP, formatDate, formatDay, formatPct, formatQty } from '../utils/format';

const STATUS_OPTIONS: SegmentedOption<ProjectStatus>[] = [
  { value: 'planning', label: STATUS_LABEL.planning },
  { value: 'in-progress', label: STATUS_LABEL['in-progress'] },
  { value: 'finished', label: STATUS_LABEL.finished },
];

/** Medidas con las que se guardó un cálculo: "Largo 5 m · Ancho 4 m · …". */
function inputSummary(calculation: ProjectCalculation): string[] {
  const fields = CALCULATOR_META[calculation.calculatorType]?.fields ?? [];
  const parts = fields
    .filter((f) => calculation.inputs[f.name] !== undefined)
    .map((f) => {
      const value = calculation.inputs[f.name];
      if (f.options) return f.options.find((o) => o.value === value)?.label ?? String(value);
      return `${f.short ?? f.label} ${formatQty(Number(value))} ${f.unit}`;
    });
  const waste = calculation.inputs.wastePct;
  if (waste !== undefined) parts.push(`Desperdicio ${formatPct(Number(waste))}`);
  return parts;
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [calcToDelete, setCalcToDelete] = useState<ProjectCalculation | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.get(projectId!),
    enabled: !!projectId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
  };

  const updateMutation = useMutation({
    mutationFn: (changes: Parameters<typeof projectsApi.update>[1]) =>
      projectsApi.update(projectId!, changes),
    onSuccess: () => {
      toast.success('Proyecto actualizado');
      setEditing(false);
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo actualizar el proyecto')),
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.remove(projectId!),
    onSuccess: () => {
      toast.success('Proyecto eliminado');
      // refetchType: 'none' evita que esta misma página (aún montada) vuelva a pedir
      // el detalle del proyecto que se acaba de borrar antes de que navigate() la desmonte.
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'none' });
      navigate('/projects', { replace: true });
    },
    onError: (err) => {
      setConfirmingDelete(false);
      toast.error(apiErrorMessage(err, 'No se pudo eliminar el proyecto'));
    },
  });

  const removeCalcMutation = useMutation({
    mutationFn: (calculationId: string) => projectsApi.removeCalculation(projectId!, calculationId),
    onSuccess: () => {
      toast.success('Cálculo eliminado');
      invalidate();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'No se pudo eliminar el cálculo')),
    onSettled: () => setCalcToDelete(null),
  });

  if (!projectId) return <Navigate to="/projects" replace />;

  if (isLoading) {
    return (
      <div className="space-y-6" role="status">
        <span className="sr-only">Cargando proyecto…</span>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <EmptyState
        icon={<PiFolders />}
        title="No encontramos este proyecto"
        description="No se encontró el proyecto o no tienes acceso."
        action={
          <ButtonLink to="/projects" variant="secondary" icon={<PiArrowLeft aria-hidden="true" />}>
            Volver a proyectos
          </ButtonLink>
        }
      />
    );
  }

  const calcLabel = (c: ProjectCalculation) =>
    CALCULATOR_META[c.calculatorType]?.label ?? c.calculatorType;

  return (
    <div className="animate-rise space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <PiArrowLeft aria-hidden="true" className="h-4 w-4" />
        Proyectos
      </Link>

      {/* ---------------------------------------------------------- cabecera */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="title-page break-words">{project.name}</h1>

          {(project.location || project.startDate || project.endDate) && (
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-muted">
              {project.location && (
                <li className="flex items-center gap-1.5">
                  <PiMapPin aria-hidden="true" className="h-4 w-4" />
                  {project.location}
                </li>
              )}
              {(project.startDate || project.endDate) && (
                <li className="flex items-center gap-1.5">
                  <PiCalendarBlank aria-hidden="true" className="h-4 w-4" />
                  {project.startDate ? formatDay(project.startDate) : 'Sin fecha de inicio'}
                  {' – '}
                  {project.endDate ? formatDay(project.endDate) : 'sin fecha de fin'}
                </li>
              )}
            </ul>
          )}

          {project.description && (
            <p className="mt-3 max-w-2xl text-ink-muted">{project.description}</p>
          )}

          <div className="mt-5">
            <p className="eyebrow mb-2">Estado del proyecto</p>
            <SegmentedControl
              label="Estado del proyecto"
              value={project.status}
              onChange={(status) => updateMutation.mutate({ status })}
              options={STATUS_OPTIONS}
              disabled={updateMutation.isPending}
              className="w-full overflow-x-auto sm:w-auto"
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 print:hidden">
          <Button
            variant="secondary"
            icon={<PiPencilSimple aria-hidden="true" />}
            onClick={() => setEditing(true)}
          >
            Editar
          </Button>
          <Button
            variant="danger-ghost"
            icon={<PiTrash aria-hidden="true" />}
            onClick={() => setConfirmingDelete(true)}
          >
            Eliminar proyecto
          </Button>
        </div>
      </header>

      {/* -------------------------------------------------------- presupuesto */}
      <section className="card p-5 sm:p-6" aria-labelledby="proyecto-presupuesto">
        <h2 id="proyecto-presupuesto" className="title-section mb-5">
          Presupuesto
        </h2>
        <BudgetSummary summary={project.summary} variant="detail" />
      </section>

      {/* ----------------------------------------------------------- cálculos */}
      <section className="card overflow-hidden" aria-labelledby="proyecto-calculos">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:px-6">
          <h2 id="proyecto-calculos" className="title-section">
            Cálculos ({project.calculations.length})
          </h2>
          <ButtonLink
            to="/calculators"
            variant="secondary"
            size="sm"
            icon={<PiPlus aria-hidden="true" />}
            className="print:hidden"
          >
            Agregar cálculo
          </ButtonLink>
        </div>

        {project.calculations.length === 0 ? (
          <EmptyState
            bare
            className="border-t border-line"
            icon={<PiListChecks />}
            title="Aún no hay cálculos"
            description="Ve a Calculadoras, haz un cálculo y guárdalo en este proyecto."
          />
        ) : (
          <div className="overflow-x-auto border-t border-line">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Tipo</th>
                  <th scope="col" className="num hidden sm:table-cell">
                    Cantidad
                  </th>
                  <th scope="col" className="hidden sm:table-cell">
                    Fecha
                  </th>
                  <th scope="col" className="num">
                    Costo
                  </th>
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {project.calculations.map((c) => {
                  const open = expandedId === c.id;
                  const materials = c.result?.materials ?? [];
                  return (
                    <Fragment key={c.id}>
                      <tr>
                        <td>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded text-left"
                            aria-expanded={open}
                            aria-controls={`calculo-${c.id}`}
                            onClick={() => setExpandedId(open ? null : c.id)}
                          >
                            <span
                              aria-hidden="true"
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-strong text-ink-muted [&>svg]:h-5 [&>svg]:w-5"
                            >
                              {CALCULATOR_META[c.calculatorType]?.icon}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-semibold">{calcLabel(c)}</span>
                              <span className="block text-xs text-ink-subtle sm:hidden">
                                {formatQty(c.quantity)} {c.unit} · {formatDate(c.createdAt)}
                              </span>
                            </span>
                            <PiCaretDown
                              aria-hidden="true"
                              className={clsx(
                                'h-4 w-4 shrink-0 text-ink-subtle transition-transform',
                                open && 'rotate-180'
                              )}
                            />
                            <span className="sr-only">{open ? 'Ocultar detalle' : 'Ver detalle'}</span>
                          </button>
                        </td>
                        <td className="num hidden whitespace-nowrap sm:table-cell">
                          {formatQty(c.quantity)} {c.unit}
                        </td>
                        <td className="hidden whitespace-nowrap text-ink-muted sm:table-cell">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="num whitespace-nowrap font-semibold">
                          {formatCOP(c.totalCost)}
                        </td>
                        <td className="w-px py-1 pl-0 text-right">
                          <IconButton
                            label={`Eliminar cálculo de ${calcLabel(c)}`}
                            tone="danger"
                            className="print:hidden"
                            onClick={() => setCalcToDelete(c)}
                          >
                            <PiTrash aria-hidden="true" />
                          </IconButton>
                        </td>
                      </tr>
                      {open && (
                        <tr id={`calculo-${c.id}`} className="bg-surface-muted">
                          <td colSpan={5}>
                            <div className="grid gap-5 py-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                              <div>
                                <p className="eyebrow">Medidas</p>
                                <ul className="mt-2 space-y-1 text-ink-muted">
                                  {inputSummary(c).map((part) => (
                                    <li key={part}>{part}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="eyebrow">Materiales</p>
                                <ul className="mt-2 space-y-1">
                                  {materials.map((m) => (
                                    <li key={m.role} className="flex justify-between gap-4">
                                      <span className="text-ink-muted">
                                        {m.name} · {formatQty(m.quantity)} {m.unit}
                                      </span>
                                      <span className="whitespace-nowrap tabular-nums">
                                        {formatCOP(m.totalPrice)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PurchaseList calculations={project.calculations} />

      {/* ------------------------------------------------------------ diálogos */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Editar proyecto">
        <EditProjectForm
          project={project}
          submitting={updateMutation.isPending}
          onCancel={() => setEditing(false)}
          onSubmit={(changes) => updateMutation.mutate(changes)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmingDelete}
        title="¿Eliminar este proyecto?"
        description={
          <>
            Se eliminará <strong className="font-semibold text-ink">{project.name}</strong> y todos
            sus cálculos. Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar proyecto"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmingDelete(false)}
      />

      <ConfirmDialog
        open={calcToDelete !== null}
        title="¿Eliminar este cálculo?"
        description={
          calcToDelete && (
            <>
              Se quitará el cálculo de{' '}
              <strong className="font-semibold text-ink">{calcLabel(calcToDelete)}</strong> (
              {formatQty(calcToDelete.quantity)} {calcToDelete.unit},{' '}
              {formatCOP(calcToDelete.totalCost)}) de este proyecto.
            </>
          )
        }
        confirmLabel="Eliminar cálculo"
        loading={removeCalcMutation.isPending}
        onConfirm={() => calcToDelete && removeCalcMutation.mutate(calcToDelete.id)}
        onCancel={() => setCalcToDelete(null)}
      />
    </div>
  );
}
