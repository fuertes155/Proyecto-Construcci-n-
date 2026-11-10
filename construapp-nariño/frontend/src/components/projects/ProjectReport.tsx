import type { ProjectDetail } from '../../services/projects';
import { formatCOP, formatDateTime, formatPct, formatQty } from '../../utils/format';
import { CALCULATOR_META } from '../calculators/calculatorMeta';
import { purchaseLines } from './PurchaseList';
import { STATUS_LABEL } from './StatusBadge';

export default function ProjectReport({
  project,
  preview = false,
}: {
  project: ProjectDetail;
  preview?: boolean;
}) {
  const lines = purchaseLines(project.calculations);
  const incomplete = lines.some((line) => line.total === null);
  return (
    <article
      className={`project-report${preview ? ' is-preview' : ''}`}
      aria-label="Informe imprimible del proyecto"
    >
      <header className="report-heading">
        <p className="report-brand">ConstruApp Nariño · Presupuesto de materiales</p>
        <h1>{project.name}</h1>
        <p>
          {project.location || 'Ubicación sin especificar'} · {STATUS_LABEL[project.status]}
        </p>
        <p>Emitido: {formatDateTime(new Date().toISOString())} · Moneda: COP</p>
        <p>Referencia: {project.id.slice(0, 8).toUpperCase()}</p>
        {project.description && <p>{project.description}</p>}
      </header>
      <dl className="report-totals">
        <div>
          <dt>Costo estimado de materiales</dt>
          <dd>{formatCOP(project.summary.totalCost)}</dd>
        </div>
        <div>
          <dt>Presupuesto objetivo</dt>
          <dd>{formatCOP(project.summary.budget)}</dd>
        </div>
        <div>
          <dt>{project.summary.overBudget ? 'Exceso' : 'Disponible'}</dt>
          <dd>
            {formatCOP(
              project.summary.budgetRemaining === null
                ? null
                : Math.abs(project.summary.budgetRemaining)
            )}
          </dd>
        </div>
      </dl>
      {incomplete && (
        <p className="report-notice">
          Presupuesto parcial: hay materiales sin precio. Deben cotizarse antes de comprar.
        </p>
      )}
      <h2>Cálculos de la obra</h2>
      <table>
        <thead>
          <tr>
            <th>Actividad y medidas</th>
            <th>Cantidad</th>
            <th>Costo</th>
          </tr>
        </thead>
        <tbody>
          {project.calculations.map((calculation) => {
            const meta = CALCULATOR_META[calculation.calculatorType];
            return (
              <tr key={calculation.id}>
                <td>
                  <strong>{meta.label}</strong>
                  <p>
                    {meta.fields
                      .filter((field) => calculation.inputs[field.name] !== undefined)
                      .map((field) => {
                        const value = calculation.inputs[field.name];
                        return `${field.label}: ${field.options ? (field.options.find((option) => option.value === value)?.label ?? String(value)) : `${formatQty(Number(value))} ${field.unit}`}`;
                      })
                      .join(' · ')}
                  </p>
                  <p>
                    Desperdicio: {formatPct(calculation.result.wastePct)} ·{' '}
                    {formatDateTime(calculation.createdAt)}
                  </p>
                </td>
                <td>
                  {formatQty(calculation.quantity)} {calculation.unit}
                </td>
                <td>{formatCOP(calculation.totalCost)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h2>Lista de compra consolidada</h2>
      <table>
        <thead>
          <tr>
            <th>Material y proveedor</th>
            <th>Cantidad</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={`${line.name}|${line.unit}`}>
              <td>
                <strong>{line.name}</strong>
                <p>{line.providers.join(' · ') || 'Sin precio registrado'}</p>
              </td>
              <td>
                {formatQty(line.quantity)} {line.unit}
              </td>
              <td>{formatCOP(line.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="report-grand-total">
        Total estimado del proyecto: {formatCOP(project.summary.totalCost)}
      </p>
      <h2>Fuentes y condiciones de compra</h2>
      {lines.map((line) => (
        <div className="report-source" key={`source-${line.name}`}>
          <strong>{line.name}</strong>
          {line.sources.length === 0 ? (
            <p>Precio registrado manualmente; confirma el valor con el proveedor.</p>
          ) : (
            line.sources.map((source, i) => (
              <div key={i}>
                <p>
                  {source.sourceProduct}
                  {source.checkedAt ? ` · Consulta: ${formatDateTime(source.checkedAt)}` : ''}
                </p>
                {source.sourceUrl && /^https?:\/\//i.test(source.sourceUrl) && (
                  <p>
                    <a href={source.sourceUrl}>{source.sourceUrl}</a>
                  </p>
                )}
                {source.sourceNotes && <p>{source.sourceNotes}</p>}
              </div>
            ))
          )}
        </div>
      ))}
      <footer className="report-notice">
        Cantidades aproximadas. Los importes conservan los precios de cada cálculo guardado; no son
        una cotización vinculante. No incluye mano de obra. Confirma disponibilidad, transporte,
        impuestos pendientes, pedidos mínimos y redondeo a empaques. Revisa las cantidades con un
        profesional antes de comprar.
      </footer>
    </article>
  );
}
