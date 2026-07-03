'use client'

interface DHVisualizerProps {
  currentStep: number
}

export default function DHVisualizer({ currentStep }: DHVisualizerProps) {
  // Paint analog color mapping per step
  // Step 0: mod p & g
  // Step 1: Yellow common paint
  // Step 2: Alice secret (Red)
  // Step 3: Alice public mix (Orange)
  // Step 4: Bob secret (Blue)
  // Step 5: Bob public mix (Green)
  // Step 6: Public exchange (Orange and Green)
  // Step 7: Alice shared secret mix (Brown)
  // Step 8: Bob shared secret mix (Brown)
  // Step 9: Shared secret K established

  const paintColors = {
    yellow: 'bg-amber-400 border-amber-500 shadow-amber-400/20 text-amber-950',
    red: 'bg-red-500 border-red-600 shadow-red-500/20 text-white',
    blue: 'bg-blue-500 border-blue-600 shadow-blue-500/20 text-white',
    orange: 'bg-orange-500 border-orange-600 shadow-orange-500/20 text-white',
    green: 'bg-green-500 border-green-600 shadow-green-500/20 text-white',
    brown: 'bg-amber-900 border-amber-950 shadow-amber-900/20 text-amber-50',
  }

  const renderPaintCircle = (colorKey: keyof typeof paintColors, label: string, amount: string = '') => {
    return (
      <div className="flex flex-col items-center gap-1.5 transition-all duration-500">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 font-semibold shadow-lg transition-all duration-500 scale-100 hover:scale-105 ${paintColors[colorKey]}`}
        >
          <span className="text-2xs font-bold uppercase tracking-wider">{amount}</span>
        </div>
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        DH Paint Mixing Visual Analogy
      </h5>

      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-950/30">
        <div className="flex flex-col items-center justify-center gap-8">
          {/* Top parameters / public */}
          {currentStep >= 1 && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Public Parameters
              </span>
              {renderPaintCircle('yellow', 'Common Paint', 'Yellow')}
            </div>
          )}

          {/* Parties: Alice & Bob */}
          <div className="grid w-full grid-cols-2 gap-4 border-t border-zinc-150 pt-6 dark:border-zinc-800">
            {/* Alice Side */}
            <div className="flex flex-col items-center border-r border-zinc-150 pr-2 dark:border-zinc-850">
              <span className="mb-4 font-sans text-xs font-bold text-teal-600 dark:text-teal-400">
                Alice
              </span>
              <div className="flex flex-col gap-6">
                {currentStep >= 2 && renderPaintCircle('red', 'Secret Paint (a)', 'Red')}
                {currentStep >= 3 && currentStep < 7 && renderPaintCircle('orange', 'Public Mix (A)', 'Orange')}
                {currentStep >= 6 && currentStep < 7 && (
                  <div className="flex flex-col items-center gap-1">
                    <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span className="text-3xs text-zinc-400 uppercase">Sending Mix A</span>
                  </div>
                )}
                {currentStep >= 7 && (
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-3xs text-zinc-400 uppercase">Received Bob Mix B (Green)</span>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <span>Green</span>
                      <span>+</span>
                      <span>Red (Secret)</span>
                    </div>
                    {renderPaintCircle('brown', 'Shared Secret (K)', 'Brown')}
                  </div>
                )}
              </div>
            </div>

            {/* Bob Side */}
            <div className="flex flex-col items-center pl-2">
              <span className="mb-4 font-sans text-xs font-bold text-indigo-600 dark:text-indigo-400">
                Bob
              </span>
              <div className="flex flex-col gap-6">
                {currentStep >= 4 && renderPaintCircle('blue', 'Secret Paint (b)', 'Blue')}
                {currentStep >= 5 && currentStep < 8 && renderPaintCircle('green', 'Public Mix (B)', 'Green')}
                {currentStep >= 6 && currentStep < 8 && (
                  <div className="flex flex-col items-center gap-1">
                    <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                    </svg>
                    <span className="text-3xs text-zinc-400 uppercase">Sending Mix B</span>
                  </div>
                )}
                {currentStep >= 8 && (
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-3xs text-zinc-400 uppercase">Received Alice Mix A (Orange)</span>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <span>Orange</span>
                      <span>+</span>
                      <span>Blue (Secret)</span>
                    </div>
                    {renderPaintCircle('brown', 'Shared Secret (K)', 'Brown')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
