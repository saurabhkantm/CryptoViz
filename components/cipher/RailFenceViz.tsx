'use client'

interface RailFenceVizProps {
  matrix?: string[][]
  highlight?: number[] // indices to highlight in the columns
}

export default function RailFenceViz({ matrix, highlight = [] }: RailFenceVizProps) {
  if (!matrix || matrix.length === 0) return null

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h5 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Rail Fence Zigzag Rails
      </h5>
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
        <div className="flex flex-col gap-2 min-w-max">
          {matrix.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1.5 font-mono text-sm">
              <span className="w-16 shrink-0 font-sans text-xs font-bold text-zinc-400 dark:text-zinc-500">
                Rail {rIdx + 1}
              </span>
              {row.map((char, cIdx) => {
                const isHighlight = highlight.includes(cIdx) && char !== '.'
                const isEmpty = char === '.'

                return (
                  <div
                    key={cIdx}
                    className={`flex h-8 w-8 items-center justify-center rounded font-bold transition-all duration-300 ${
                      isEmpty
                        ? 'text-zinc-300 dark:text-zinc-800'
                        : isHighlight
                        ? 'bg-teal-500 text-white scale-110 shadow-md shadow-teal-500/20 dark:bg-teal-400 dark:text-zinc-950'
                        : 'bg-white border border-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {char}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
