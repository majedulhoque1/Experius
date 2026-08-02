/*
  The thesis, drawn: scattered work becomes a structure, then the structure
  starts moving on its own.

  Deliberately CSS-driven rather than GSAP. This is a discrete three-state
  change owned by React, not a scroll-scrubbed timeline — and an earlier GSAP
  version fought the renderer, because every re-render re-applied the scatter
  transform from JSX and stomped the in-flight tween. GSAP stays on scroll
  timelines; state changes belong to React and CSS.

  Nodes are chamfered squares rather than circles so the diagram sits on the
  same 45° grid as the wordmark, and the scattered state carries random
  rotation — rotation is what reads as disorder; position alone just reads as
  spacing.
*/

const VB = 420
const NODE = 30
const CHAMFER = 8

type Placement = { x: number; y: number; r: number; s: number }

const SCATTER: Placement[] = [
  { x: 58, y: 78, r: -18, s: 0.86 },
  { x: 214, y: 44, r: 24, s: 1.04 },
  { x: 352, y: 100, r: -9, s: 0.92 },
  { x: 96, y: 208, r: 33, s: 1.1 },
  { x: 264, y: 170, r: -27, s: 1 },
  { x: 378, y: 250, r: 14, s: 0.88 },
  { x: 64, y: 332, r: -35, s: 1.06 },
  { x: 208, y: 302, r: 20, s: 0.94 },
  { x: 330, y: 366, r: -12, s: 0.9 },
]

const GRID: Placement[] = Array.from({ length: 9 }, (_, i) => ({
  x: 76 + (i % 3) * 134,
  y: 84 + Math.floor(i / 3) * 126,
  r: 0,
  s: 1,
}))

const LINKS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5],
  [3, 4], [4, 5], [3, 6], [4, 7], [5, 8], [6, 7], [7, 8],
]

const h = NODE / 2
/** Square with top-right and bottom-left corners cut at 45°, centred on 0,0. */
const NODE_PATH = [
  `M${-h} ${-h}`,
  `H${h - CHAMFER}`,
  `L${h} ${-h + CHAMFER}`,
  `V${h}`,
  `H${-h + CHAMFER}`,
  `L${-h} ${h - CHAMFER}`,
  'Z',
].join(' ')

const place = (p: Placement) =>
  `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) scale(${p.s})`

export function SystemDiagram({ state }: { state: 0 | 1 | 2 }) {
  const nodes = state === 0 ? SCATTER : GRID
  const linkOpacity = state === 0 ? 0 : state === 1 ? 0.32 : 0.72

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} className="h-auto w-full" aria-hidden>
      <g stroke="var(--color-accent)" strokeWidth={1.5}>
        {LINKS.map(([a, b], i) => (
          <line
            key={i}
            x1={GRID[a].x}
            y1={GRID[a].y}
            x2={GRID[b].x}
            y2={GRID[b].y}
            style={{
              opacity: linkOpacity,
              transition: `opacity 700ms var(--ease-out-quart) ${180 + i * 22}ms`,
            }}
          />
        ))}
      </g>

      {nodes.map((p, i) => (
        <g
          key={i}
          style={{
            transform: place(p),
            transition: `transform 1000ms var(--ease-out-quart) ${i * 32}ms`,
          }}
        >
          <path
            d={NODE_PATH}
            fill={i === 4 ? 'var(--color-accent)' : 'var(--color-paper)'}
            stroke={i === 4 ? 'var(--color-accent)' : 'var(--color-ink-3)'}
            strokeWidth={1.25}
          />
        </g>
      ))}

      {/* A pulse that only exists once the system runs itself. */}
      {state === 2 && (
        <circle r={4} fill="var(--color-accent)">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path={`M${GRID[0].x} ${GRID[0].y} L${GRID[4].x} ${GRID[4].y} L${GRID[8].x} ${GRID[8].y}`}
          />
        </circle>
      )}
    </svg>
  )
}
