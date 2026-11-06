import { useQuery } from '@tanstack/react-query';
import { PiArrowUpRight } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { catalogApi } from '../services/catalog';
import { CALCULATOR_IDS } from './calculators/calculatorMeta';

export default function CatalogSnapshot() {
  const { data, isLoading } = useQuery({
    queryKey: ['catalog', 'materials', '', ''],
    queryFn: () => catalogApi.materials(),
  });
  const prices = data?.materials.flatMap((material) => material.prices) ?? [];
  const pricedMaterials = data?.materials.filter((material) => material.prices.length > 0).length;
  const providers = data ? new Set(prices.map((price) => price.providerId)).size : undefined;
  const number = (value: number | undefined) =>
    value === undefined ? '—' : String(value).padStart(2, '0');
  return (
    <div
      className="catalog-snapshot"
      role="group"
      aria-label="Herramientas y catálogo disponible"
      aria-busy={isLoading}
    >
      <div>
        <strong>{number(CALCULATOR_IDS.length)}</strong>
        <span>
          Calculadoras
          <br />
          para tu obra
        </span>
      </div>
      <div>
        <strong>{number(pricedMaterials)}</strong>
        <span>
          Materiales
          <br />
          con precio publicado
        </span>
      </div>
      <div>
        <strong>{number(providers)}</strong>
        <span>
          Comercios
          <br />
          en el catálogo
        </span>
      </div>
      <Link to="/providers" className="group">
        <span>
          Ver catálogo
          <br />
          <b>Precios en pesos colombianos</b>
        </span>
        <PiArrowUpRight
          aria-hidden="true"
          className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
