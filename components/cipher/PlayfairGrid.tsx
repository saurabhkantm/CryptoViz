'use client'

interface PlayfairGridProps {
  matrix?: string[][] | string
  highlights?: number[] // Indices or coords to highlight
}

export default function PlayfairGrid({ matrix, highlights = [] }: PlayfairGridProps) {
  if (!matrix) return null

  // If the matrix is passed as a flat string or 1D array, construct a 2D array
  let grid: string[][] = []
  if (typeof matrix === 'string') {
    const chars = matrix.split('')
    for (let i = 0; i < 5; i++) {
      grid.push(chars.slice(i * 5, i * 5 + 5))
    }
  } else {
    grid = matrix
  }

  // Convert 1D highlights to 2D coords if needed, or handle indices
  // Let's assume highlights contains 1D indices (0 to 24) of cells to highlight
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h5 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Playfair 5x5 Matrix (I/J Shared)
      </h5>
      <div className="grid grid-cols-5 gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-800 dark:bg-zinc-950/30">
        {grid.map((row, rIdx) =>
          row.map((char, cIdx) => {
            const flatIdx = rIdx * 5 + cIdx
            const isHighlighted = highlights.includes(flatIdx)

            return (
              <div
                key={flatIdx}
                className={`flex h-12 w-12 items-center justify-center rounded-lg border font-mono text-lg font-bold transition-all duration-300 ${
                  isHighlighted
                    ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-md shadow-teal-500/10 dark:border-teal-400 dark:bg-teal-950/50 dark:text-teal-400'
                    : 'border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
                }`}
              >
                {char}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
