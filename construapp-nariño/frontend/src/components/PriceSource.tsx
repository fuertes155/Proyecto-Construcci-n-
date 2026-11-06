import { formatDate } from '../utils/format';
import type { PriceSourceInfo } from '../services/priceSource';

/** La fecha corresponde a la consulta de la fuente, no al guardado de la fila. */
export default function PriceSource({ price }: { price: PriceSourceInfo }) {
  const safeUrl = price.sourceUrl && /^https?:\/\//i.test(price.sourceUrl) ? price.sourceUrl : null;
  return (
    <div className="mt-1 space-y-1 break-words text-xs font-normal leading-relaxed text-ink-subtle">
      {price.sourceProduct && <p>{price.sourceProduct}</p>}
      {safeUrl && (
        <p>
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver precio${price.sourceProduct ? ` de ${price.sourceProduct}` : ''} en la tienda (abre en otra pestaña)`}
            className="font-semibold text-ink-muted underline underline-offset-2 hover:text-ink"
          >
            Ver precio en la tienda
          </a>
          {price.checkedAt && <> · Consultado {formatDate(price.checkedAt)}</>}
        </p>
      )}
      {price.sourceNotes && <p>{price.sourceNotes}</p>}
    </div>
  );
}
