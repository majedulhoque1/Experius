import type { ArchitectureNode } from '../../content/types'

/*
  The system diagram for a case study is generated from that case study's own
  `architecture` array — not drawn by hand per page. If the data says the
  storefront feeds orders and orders feed the invoice job, that is what gets
  drawn. A diagram that cannot drift from the facts is worth more than a
  prettier one that can.

  Nodes are placed in columns by dependency depth. Connectors use the brand's
  45° elbow rather than curves.
*/

const COL_W = 210
const ROW_H = 92
const BOX_W = 168
const BOX_H = 56
const CHAMFER = 10
const PAD = 16

function depths(nodes: ArchitectureNode[]) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const memo = new Map<string, number>()

  const walk = (id: string, seen: Set<string>): number => {
    if (memo.has(id)) return memo.get(id)!
    if (seen.has(id)) return 0 // defensive: never loop on a cyclic definition
    seen.add(id)
    const parents = nodes.filter((n) => n.feeds?.includes(id))
    const d = parents.length === 0 ? 0 : Math.max(...parents.map((p) => walk(p.id, seen) + 1))
    memo.set(id, d)
    return d
  }

  nodes.forEach((n) => walk(n.id, new Set()))
  return { byId, memo }
}

/** Box with top-right and bottom-left corners cut, matching the wordmark. */
function boxPath(x: number, y: number) {
  return [
    `M${x} ${y}`,
    `H${x + BOX_W - CHAMFER}`,
    `L${x + BOX_W} ${y + CHAMFER}`,
    `V${y + BOX_H}`,
    `H${x + CHAMFER}`,
    `L${x} ${y + BOX_H - CHAMFER}`,
    'Z',
  ].join(' ')
}

export function ArchitectureMap({ nodes }: { nodes: ArchitectureNode[] }) {
  if (!nodes.length) return null

  const { memo } = depths(nodes)
  const cols = new Map<number, ArchitectureNode[]>()
  nodes.forEach((n) => {
    const d = memo.get(n.id) ?? 0
    cols.set(d, [...(cols.get(d) ?? []), n])
  })

  const colCount = Math.max(...cols.keys()) + 1
  const maxRows = Math.max(...[...cols.values()].map((c) => c.length))

  const pos = new Map<string, { x: number; y: number }>()
  cols.forEach((list, d) => {
    const offset = (maxRows - list.length) / 2
    list.forEach((n, i) => {
      pos.set(n.id, { x: PAD + d * COL_W, y: PAD + (i + offset) * ROW_H })
    })
  })

  const w = PAD * 2 + (colCount - 1) * COL_W + BOX_W
  const h = PAD * 2 + maxRows * ROW_H

  return (
    <figure className="mt-10 min-w-0">
      {/*
        Wide diagrams scroll inside their own box; the page never does.
        `min-w-0` is load-bearing: a grid/flex child defaults to
        `min-width: auto`, so without it this scroll container refuses to
        shrink below the SVG's min-width and drags the whole text column
        off-screen on mobile.
      */}
      <div className="min-w-0 overflow-x-auto border border-rule bg-paper-2 p-5">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-auto"
          style={{ minWidth: `${Math.min(w, 680)}px`, width: '100%' }}
          role="img"
          aria-label={`System architecture: ${nodes.map((n) => n.label).join(', ')}`}
        >
          <g stroke="var(--color-accent)" strokeWidth={1.25} fill="none" opacity={0.7}>
            {nodes.flatMap((n) =>
              (n.feeds ?? []).map((target) => {
                const a = pos.get(n.id)
                const b = pos.get(target)
                if (!a || !b) return null
                const x1 = a.x + BOX_W
                const y1 = a.y + BOX_H / 2
                const x2 = b.x
                const y2 = b.y + BOX_H / 2

                /*
                  Orthogonal route with mitred corners: out, across, in. The
                  column gap is far smaller than the row pitch, so a single
                  diagonal cannot stay at 45° — mitring the two corners keeps
                  the brand angle without the line crossing its neighbours.
                */
                const dy = y2 - y1
                const dir = Math.sign(dy)
                const midX = x1 + (x2 - x1) / 2
                const c = Math.min(10, Math.abs(dy) / 2)

                const d =
                  Math.abs(dy) < 1
                    ? `M${x1} ${y1} H${x2}`
                    : `M${x1} ${y1} H${midX - c} L${midX} ${y1 + c * dir} ` +
                      `V${y2 - c * dir} L${midX + c} ${y2} H${x2}`

                return <path key={`${n.id}-${target}`} d={d} />
              }),
            )}
          </g>

          {nodes.map((n) => {
            const p = pos.get(n.id)!
            return (
              <g key={n.id}>
                <path
                  d={boxPath(p.x, p.y)}
                  fill="var(--color-paper)"
                  stroke="var(--color-ink-3)"
                />
                <text
                  x={p.x + BOX_W / 2}
                  y={p.y + BOX_H / 2 + 4}
                  textAnchor="middle"
                  fill="var(--color-ink)"
                  style={{
                    font: '500 12px var(--font-sans)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {n.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <figcaption className="type-note mt-4 flex gap-3 border-t border-rule-soft pt-4">
        <span className="shrink-0 font-semibold text-ink-2">Fig. 2</span>
        <span>System architecture, generated from this project&rsquo;s own module data.</span>
      </figcaption>
    </figure>
  )
}
