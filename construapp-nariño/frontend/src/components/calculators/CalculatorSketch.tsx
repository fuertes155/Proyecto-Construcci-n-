import clsx from 'clsx';
import { useId } from 'react';
import type { CalculatorId } from '../../services/calculators';

/** Texto de una cota: nombre de la medida y, si ya se escribió, su valor ("5 m"). */
export interface SketchDim {
  label: string;
  value?: string;
}

type Point = [number, number];
type Dims = Record<string, SketchDim>;

const VIEW_BOX = '0 0 360 212';

const DEFAULT_DIMS: Record<CalculatorId, Dims> = {
  concrete: {
    length: { label: 'Largo' },
    width: { label: 'Ancho' },
    height: { label: 'Espesor' },
  },
  footing: {
    length: { label: 'Largo' },
    width: { label: 'Ancho' },
    height: { label: 'Alto' },
    stonePct: { label: 'Piedra' },
  },
  rebar: {
    length: { label: 'Largo' },
    width: { label: 'Ancho' },
    spacing: { label: 'Separación' },
  },
  brick: { width: { label: 'Ancho' }, height: { label: 'Alto' } },
  block: { width: { label: 'Ancho' }, height: { label: 'Alto' } },
  mortar: { area: { label: 'Área' }, thickness: { label: 'Espesor' } },
  tile: { area: { label: 'Área' } },
  paint: { area: { label: 'Área' }, coats: { label: 'Manos' } },
  roof: { area: { label: 'Área' } },
};

const ARIA_LABEL: Record<CalculatorId, string> = {
  concrete: 'Croquis de una losa de hormigón con sus cotas de largo, ancho y espesor',
  footing: 'Croquis de un cimiento ciclópeo con piedras y sus cotas de largo, ancho y alto',
  rebar: 'Croquis en planta de una malla de varillas con su largo, ancho y separación',
  brick: 'Croquis de un muro de ladrillo con sus cotas de ancho y alto',
  block: 'Croquis de un muro en bloque de concreto con sus cotas de ancho y alto',
  mortar: 'Croquis de una capa de mortero con su área y su espesor',
  tile: 'Croquis de un piso enchapado con su área',
  paint: 'Croquis de un muro a medio pintar con su área y el número de manos',
  roof: 'Croquis de una cubierta inclinada en teja con su área medida sobre la pendiente',
};

const points = (...pts: Point[]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** Proyección isométrica: `x` baja hacia la derecha, `y` hacia la izquierda, `z` sube. */
function isometric(originX: number, originY: number) {
  const cos = Math.cos(Math.PI / 6);
  return (x: number, y: number, z = 0): Point => [
    originX + (x - y) * cos,
    originY + (x + y) * 0.5 - z,
  ];
}

const TEXT_BASE =
  'font-sans text-[13px] font-semibold [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]';

// El texto lleva un halo del color del fondo para leerse sobre las líneas. Si el croquis
// va sobre otro fondo, el contenedor define `--sketch-halo`.
const TEXT_CLASS = `fill-current ${TEXT_BASE} [stroke:var(--sketch-halo,rgb(var(--surface-muted)))]`;

const OUTLINE = 'stroke-ink-muted [stroke-linejoin:round] [stroke-width:1.25px]';

const dimText = (dim: SketchDim) => (dim.value ? `${dim.label} ${dim.value}` : dim.label);

interface DimProps {
  from: Point;
  to: Point;
  dim: SketchDim;
  /**
   * `along`: texto sobre la línea. `side`: texto horizontal en dos renglones, del lado
   * hacia el que apunta la normal (a la izquierda si la línea baja, a la derecha si sube).
   */
  mode?: 'along' | 'side';
}

/** Línea de cota con topes y su texto, como en un plano. Se resalta cuando ya tiene valor. */
function Dim({ from, to, dim, mode = 'along' }: DimProps) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / length;
  const uy = (y2 - y1) / length;
  // Normal a la izquierda del sentido de avance: hacia donde va el texto.
  const nx = -uy;
  const ny = ux;
  const tick = 5;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  let label;
  if (mode === 'side') {
    const x = midX + nx * 9;
    label = (
      <text x={x} y={midY} textAnchor={nx > 0 ? 'start' : 'end'} className={TEXT_CLASS}>
        <tspan x={x} dy={dim.value ? '-0.25em' : '0.35em'}>
          {dim.label}
        </tspan>
        {dim.value && (
          <tspan x={x} dy="1.15em">
            {dim.value}
          </tspan>
        )}
      </text>
    );
  } else {
    const x = midX + nx * 13;
    const y = midY + ny * 13;
    let angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    if (angle > 90 || angle < -90) angle += 180;
    label = (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(${angle.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`}
        className={TEXT_CLASS}
      >
        {dimText(dim)}
      </text>
    );
  }

  return (
    <g
      className={clsx(
        'transition-colors duration-200',
        dim.value ? 'text-brand-text' : 'text-ink-muted'
      )}
    >
      <g stroke="currentColor" strokeWidth={1.25} strokeLinecap="round">
        <line x1={x1} y1={y1} x2={x2} y2={y2} />
        <line x1={x1 - nx * tick} y1={y1 - ny * tick} x2={x1 + nx * tick} y2={y1 + ny * tick} />
        <line x1={x2 - nx * tick} y1={y2 - ny * tick} x2={x2 + nx * tick} y2={y2 + ny * tick} />
      </g>
      {label}
    </g>
  );
}

/** Rótulo sobre una superficie del dibujo (área, manos…), con halo del color de esa cara. */
function FaceLabel({ at, dim, dy = 0 }: { at: Point; dim: SketchDim; dy?: number }) {
  return (
    <text
      x={at[0]}
      y={at[1] + dy}
      textAnchor="middle"
      dominantBaseline="central"
      className={clsx(
        TEXT_BASE,
        'stroke-surface transition-colors duration-200',
        dim.value ? 'fill-brand-text' : 'fill-ink-muted'
      )}
    >
      {dimText(dim)}
    </text>
  );
}

/** Desplaza un punto en perpendicular a la arista `a → b` (hacia fuera del volumen). */
function offset(point: Point, a: Point, b: Point, distance: number): Point {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const nx = -(b[1] - a[1]) / length;
  const ny = (b[0] - a[0]) / length;
  return [point[0] + nx * distance, point[1] + ny * distance];
}

/** Terreno: línea de suelo con achurado, bajo un muro en alzado. */
function Ground({ y }: { y: number }) {
  return (
    <>
      <line x1={60} y1={y} x2={344} y2={y} className="stroke-ink-muted" strokeWidth={1.25} />
      <g className="stroke-line-control" strokeWidth={1}>
        {Array.from({ length: 20 }, (_, i) => {
          const gx = 70 + i * 14;
          return <line key={i} x1={gx} y1={y + 1} x2={gx - 7} y2={y + 8} />;
        })}
      </g>
    </>
  );
}

/* --------------------------------------------------------------- hormigón --- */

function ConcreteSketch({ dims }: { dims: Dims }) {
  const L = 150;
  const A = 110;
  const E = 24;
  const p = isometric(194, 22);

  const back = p(0, 0);
  const right = p(L, 0);
  const front = p(L, A);
  const left = p(0, A);
  const rightB = p(L, 0, -E);
  const frontB = p(L, A, -E);
  const leftB = p(0, A, -E);

  // Retícula sobre la cara superior (sugiere la malla de la losa).
  const mesh = [0.25, 0.5, 0.75].flatMap((t) => [
    [p(0, A * t), p(L, A * t)],
    [p(L * t, 0), p(L * t, A)],
  ]);

  return (
    <>
      <polygon points={points(back, right, front, left)} className={clsx('fill-surface', OUTLINE)} />
      <g className="stroke-line-strong" strokeWidth={1}>
        {mesh.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
      <polygon
        points={points(left, front, frontB, leftB)}
        className={clsx('fill-surface-strong', OUTLINE)}
      />
      <polygon
        points={points(front, right, rightB, frontB)}
        className={clsx('fill-line-strong', OUTLINE)}
      />

      <Dim
        from={offset(frontB, frontB, rightB, 14)}
        to={offset(rightB, frontB, rightB, 14)}
        dim={dims.length}
      />
      <Dim
        from={offset(leftB, leftB, frontB, 14)}
        to={offset(frontB, leftB, frontB, 14)}
        dim={dims.width}
      />
      <Dim from={[left[0] - 12, left[1]]} to={[leftB[0] - 12, leftB[1]]} dim={dims.height} mode="side" />
    </>
  );
}

/* -------------------------------------------------------- cimiento ciclópeo --- */

function FootingSketch({ dims }: { dims: Dims }) {
  const L = 160;
  const A = 56;
  const E = 50;
  const p = isometric(140, 20);

  const back = p(0, 0);
  const right = p(L, 0);
  const front = p(L, A);
  const left = p(0, A);
  const rightB = p(L, 0, -E);
  const frontB = p(L, A, -E);
  const leftB = p(0, A, -E);

  // Piedras rajón asomando en las dos caras visibles: [posición a lo largo, altura, radio].
  const leftStones: [number, number, number][] = [
    [0.12, 0.3, 7],
    [0.3, 0.68, 8],
    [0.47, 0.32, 6],
    [0.64, 0.7, 7],
    [0.8, 0.36, 8],
    [0.93, 0.74, 5],
  ];
  const rightStones: [number, number, number][] = [
    [0.3, 0.35, 6],
    [0.7, 0.68, 7],
  ];

  return (
    <>
      <polygon points={points(back, right, front, left)} className={clsx('fill-surface', OUTLINE)} />
      <polygon
        points={points(left, front, frontB, leftB)}
        className={clsx('fill-surface-strong', OUTLINE)}
      />
      <polygon
        points={points(front, right, rightB, frontB)}
        className={clsx('fill-line-strong', OUTLINE)}
      />
      <g className="fill-line-control/40 stroke-ink-muted/60" strokeWidth={1}>
        {leftStones.map(([t, h, r], i) => {
          const [cx, cy] = p(L * t, A, -E * h);
          return (
            <ellipse
              key={`l${i}`}
              cx={cx}
              cy={cy}
              rx={r}
              ry={r * 0.7}
              transform={`rotate(30 ${cx} ${cy})`}
            />
          );
        })}
        {rightStones.map(([t, h, r], i) => {
          const [cx, cy] = p(L, A * t, -E * h);
          return (
            <ellipse
              key={`r${i}`}
              cx={cx}
              cy={cy}
              rx={r}
              ry={r * 0.7}
              transform={`rotate(-30 ${cx} ${cy})`}
            />
          );
        })}
      </g>

      <Dim
        from={offset(frontB, frontB, rightB, 14)}
        to={offset(rightB, frontB, rightB, 14)}
        dim={dims.length}
      />
      <Dim
        from={offset(leftB, leftB, frontB, 14)}
        to={offset(frontB, leftB, frontB, 14)}
        dim={dims.width}
      />
      <Dim from={[left[0] - 12, left[1]]} to={[leftB[0] - 12, leftB[1]]} dim={dims.height} mode="side" />
      <FaceLabel at={p(L / 2, A / 2)} dim={dims.stonePct} />
    </>
  );
}

/* ---------------------------------------------------------------- acero --- */

function RebarSketch({ dims }: { dims: Dims }) {
  const x = 96;
  const y = 38;
  const w = 220;
  const h = 132;
  const step = 22; // separación dibujada (no está a escala)
  const verticals = Array.from({ length: Math.floor(w / step) + 1 }, (_, i) => x + i * step);
  const horizontals = Array.from({ length: Math.floor(h / step) + 1 }, (_, i) => y + i * step);

  return (
    <>
      <rect x={x} y={y} width={w} height={h} className={clsx('fill-surface', OUTLINE)} />
      <g className="stroke-ink-muted" strokeWidth={2} strokeLinecap="round">
        {verticals.map((vx) => (
          <line key={`v${vx}`} x1={vx} y1={y + 4} x2={vx} y2={y + h - 4} />
        ))}
        {horizontals.map((hy) => (
          <line key={`h${hy}`} x1={x + 4} y1={hy} x2={x + w - 4} y2={hy} />
        ))}
      </g>

      <Dim from={[x + step, y - 12]} to={[x, y - 12]} dim={dims.spacing} />
      <Dim from={[x, y + h + 18]} to={[x + w, y + h + 18]} dim={dims.length} />
      <Dim from={[x - 14, y]} to={[x - 14, y + h]} dim={dims.width} mode="side" />
    </>
  );
}

/* ---------------------------------------------------------------- muros --- */

/** Muro en alzado con su aparejo: ladrillo a soga o bloque de concreto. */
function WallSketch({ dims, kind }: { dims: Dims; kind: 'brick' | 'block' }) {
  // Los ids de React llevan ":" y no sirven dentro de `url(#…)`.
  const patternId = `aparejo-${useId().replace(/:/g, '')}`;
  const x = 84;
  const y = 24;
  const w = 236;
  const h = 128;
  const brickW = kind === 'brick' ? w / 5 : w / 6;
  const course = kind === 'brick' ? h / 8 : h / 6;
  const ground = y + h;

  return (
    <>
      <defs>
        {/* Juntas verticales alternadas entre hiladas */}
        <pattern
          id={patternId}
          x={x}
          y={y}
          width={brickW}
          height={course * 2}
          patternUnits="userSpaceOnUse"
        >
          <g
            className={kind === 'brick' ? 'stroke-brand/40' : 'stroke-ink-muted/50'}
            strokeWidth={1.25}
          >
            <line x1={0} y1={0} x2={brickW} y2={0} />
            <line x1={0} y1={course} x2={brickW} y2={course} />
            <line x1={0} y1={0} x2={0} y2={course} />
            <line x1={brickW / 2} y1={course} x2={brickW / 2} y2={course * 2} />
          </g>
        </pattern>
      </defs>

      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        className={kind === 'brick' ? 'fill-brand-soft' : 'fill-surface-strong'}
      />
      <rect x={x} y={y} width={w} height={h} fill={`url(#${patternId})`} />
      <rect x={x} y={y} width={w} height={h} className={clsx('fill-none', OUTLINE)} />

      <Ground y={ground} />
      <Dim from={[x, ground + 24]} to={[x + w, ground + 24]} dim={dims.width} />
      <Dim from={[x - 20, y]} to={[x - 20, ground]} dim={dims.height} mode="side" />
    </>
  );
}

/* --------------------------------------------------------------- pintura --- */

function PaintSketch({ dims }: { dims: Dims }) {
  const x = 84;
  const y = 24;
  const w = 236;
  const h = 128;
  const painted = w * 0.62;
  const ground = y + h;

  return (
    <>
      <rect x={x} y={y} width={w} height={h} className="fill-surface-strong" />
      {/* Parte ya pintada, con las pasadas del rodillo */}
      <rect x={x} y={y} width={painted} height={h} className="fill-info-soft" />
      <g className="stroke-info/25" strokeWidth={10}>
        {Array.from({ length: 6 }, (_, i) => {
          const sx = x + 14 + i * 24;
          return <line key={i} x1={sx} y1={y} x2={sx} y2={y + h} />;
        })}
      </g>
      <line
        x1={x + painted}
        y1={y}
        x2={x + painted}
        y2={y + h}
        className="stroke-info/60"
        strokeWidth={2}
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
      <rect x={x} y={y} width={w} height={h} className={clsx('fill-none', OUTLINE)} />

      {/* Rodillo */}
      <g className="stroke-ink-muted" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
        <rect x={x + painted - 6} y={y + 30} width={12} height={40} rx={4} className="fill-info" />
        <path
          d={`M ${x + painted + 6} ${y + 50} h 14 v 34 h -8 v 26`}
          className="fill-none"
        />
      </g>

      <Ground y={ground} />
      <FaceLabel at={[x + painted / 2, y + h / 2]} dim={dims.area} dy={-9} />
      <FaceLabel
        at={[x + painted / 2, y + h / 2]}
        // "× 2 manos" en vez de "Manos 2 manos"
        dim={dims.coats.value ? { label: "×", value: dims.coats.value } : dims.coats}
        dy={11}
      />
    </>
  );
}

/* -------------------------------------------------------- piso y enchape --- */

function TileSketch({ dims }: { dims: Dims }) {
  const L = 160;
  const A = 120;
  const E = 10;
  const n = 6; // baldosas por lado (dibujo, no a escala)
  const p = isometric(184, 30);

  const back = p(0, 0);
  const right = p(L, 0);
  const front = p(L, A);
  const left = p(0, A);
  const rightB = p(L, 0, -E);
  const frontB = p(L, A, -E);
  const leftB = p(0, A, -E);

  const joints = Array.from({ length: n - 1 }, (_, i) => (i + 1) / n).flatMap((t) => [
    [p(0, A * t), p(L, A * t)],
    [p(L * t, 0), p(L * t, A)],
  ]);
  // Baldosas alternas un tono más oscuras (damero)
  const shaded: Point[][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if ((i + j) % 2 === 0) continue;
      shaded.push([
        p((L * i) / n, (A * j) / n),
        p((L * (i + 1)) / n, (A * j) / n),
        p((L * (i + 1)) / n, (A * (j + 1)) / n),
        p((L * i) / n, (A * (j + 1)) / n),
      ]);
    }
  }

  return (
    <>
      <polygon points={points(back, right, front, left)} className="fill-surface" />
      <g className="fill-surface-strong">
        {shaded.map((quad, i) => (
          <polygon key={i} points={points(...quad)} />
        ))}
      </g>
      <g className="stroke-line-strong" strokeWidth={1}>
        {joints.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        ))}
      </g>
      <polygon points={points(back, right, front, left)} className={clsx('fill-none', OUTLINE)} />
      <polygon
        points={points(left, front, frontB, leftB)}
        className={clsx('fill-surface-strong', OUTLINE)}
      />
      <polygon
        points={points(front, right, rightB, frontB)}
        className={clsx('fill-line-strong', OUTLINE)}
      />
      <FaceLabel at={p(L / 2, A / 2)} dim={dims.area} />
    </>
  );
}

/* --------------------------------------------------------------- cubierta --- */

function RoofSketch({ dims }: { dims: Dims }) {
  const L = 170;
  const W = 100;
  const H = 50; // altura de la cumbrera sobre el alero (dibujo)
  const p = isometric(150, 62);

  const ridgeL = p(0, 0, H);
  const ridgeR = p(L, 0, H);
  const eaveR = p(L, W, 0);
  const eaveL = p(0, W, 0);

  // Ondas de la teja: de la cumbrera al alero
  const waves = Array.from({ length: 16 }, (_, i) => ((i + 1) * L) / 17);

  return (
    <>
      <polygon
        points={points(ridgeL, ridgeR, eaveR, eaveL)}
        className={clsx('fill-surface-strong', OUTLINE)}
      />
      <g className="stroke-line-control/70" strokeWidth={1}>
        {waves.map((x) => {
          const [x1, y1] = p(x, 0, H);
          const [x2, y2] = p(x, W, 0);
          return <line key={x} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      {/* Traslapo entre hiladas de tejas */}
      <line
        x1={p(0, W / 2, H / 2)[0]}
        y1={p(0, W / 2, H / 2)[1]}
        x2={p(L, W / 2, H / 2)[0]}
        y2={p(L, W / 2, H / 2)[1]}
        className="stroke-ink-muted"
        strokeWidth={1.25}
      />
      {/* Cumbrera */}
      <line
        x1={ridgeL[0]}
        y1={ridgeL[1]}
        x2={ridgeR[0]}
        y2={ridgeR[1]}
        className="stroke-ink-muted"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <FaceLabel at={p(L / 2, W / 2, H / 2)} dim={dims.area} dy={-12} />
    </>
  );
}

/* ---------------------------------------------------------------- mortero --- */

function MortarSketch({ dims }: { dims: Dims }) {
  const L = 150;
  const A = 110;
  const LAYER = 14;
  const BASE = 18;
  const p = isometric(194, 26);

  const back = p(0, 0);
  const right = p(L, 0);
  const front = p(L, A);
  const left = p(0, A);
  // Borde inferior de la capa de mortero y de la base
  const rightM = p(L, 0, -LAYER);
  const frontM = p(L, A, -LAYER);
  const leftM = p(0, A, -LAYER);
  const rightB = p(L, 0, -LAYER - BASE);
  const frontB = p(L, A, -LAYER - BASE);
  const leftB = p(0, A, -LAYER - BASE);

  return (
    <>
      {/* Base (muro o piso que se recubre) */}
      <polygon points={points(leftM, frontM, frontB, leftB)} className={clsx('fill-brand-soft', OUTLINE)} />
      <polygon points={points(frontM, rightM, rightB, frontB)} className="fill-brand-soft" />
      <polygon
        points={points(frontM, rightM, rightB, frontB)}
        className={clsx('fill-brand/20', OUTLINE)}
      />
      {/* Capa de mortero */}
      <polygon points={points(back, right, front, left)} className={clsx('fill-surface', OUTLINE)} />
      <polygon
        points={points(left, front, frontM, leftM)}
        className={clsx('fill-surface-strong', OUTLINE)}
      />
      <polygon
        points={points(front, right, rightM, frontM)}
        className={clsx('fill-line-strong', OUTLINE)}
      />

      {/* El área se rotula sobre la cara, como en un plano */}
      <FaceLabel at={p(L / 2, A / 2)} dim={dims.area} />
      <Dim from={[left[0] - 12, left[1]]} to={[leftM[0] - 12, leftM[1]]} dim={dims.thickness} mode="side" />
    </>
  );
}

/* -------------------------------------------------------------------------- */

interface CalculatorSketchProps {
  type: CalculatorId;
  /** Texto de cada cota por nombre de campo; lo que falte usa el nombre de la medida. */
  dims?: Dims;
  className?: string;
}

/**
 * Croquis acotado de lo que mide cada calculadora. Las cotas muestran en vivo
 * los valores que la persona va escribiendo, para que no confunda una medida con otra.
 */
export default function CalculatorSketch({ type, dims, className }: CalculatorSketchProps) {
  const merged = { ...DEFAULT_DIMS[type], ...dims };

  return (
    <svg
      viewBox={VIEW_BOX}
      role="img"
      aria-label={ARIA_LABEL[type]}
      className={clsx('h-auto w-full', className)}
    >
      {type === 'concrete' && <ConcreteSketch dims={merged} />}
      {type === 'footing' && <FootingSketch dims={merged} />}
      {type === 'rebar' && <RebarSketch dims={merged} />}
      {type === 'brick' && <WallSketch dims={merged} kind="brick" />}
      {type === 'block' && <WallSketch dims={merged} kind="block" />}
      {type === 'mortar' && <MortarSketch dims={merged} />}
      {type === 'tile' && <TileSketch dims={merged} />}
      {type === 'paint' && <PaintSketch dims={merged} />}
      {type === 'roof' && <RoofSketch dims={merged} />}
    </svg>
  );
}
