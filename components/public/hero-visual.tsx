import { CITIES } from '@/lib/constants/cities'

/**
 * Hero visual slot — minimalist composition built from real data.
 * No stock photos, no illustrations. Just real city names rendered
 * as a subtle map-like cluster of pills, communicating coverage.
 *
 * This is a structural placeholder ready to host richer visual content
 * (e.g. featured driver mini-cards, abstract motifs) in future phases.
 */
export function HeroVisual() {
  // Use a deterministic subset to keep the composition stable.
  const cities = CITIES.slice(0, 9)

  return (
    <div className="relative aspect-square max-w-md w-full mx-auto">
      {/* Soft glow */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-400/10 via-transparent to-transparent blur-2xl" />

      {/* Grid container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {cities.map((city, i) => (
            <div
              key={city}
              className={`px-3 py-2.5 rounded-xl border text-center text-xs font-semibold backdrop-blur-sm transition-all ${
                i === 4
                  ? 'bg-amber-400 text-[#0B1F3D] border-amber-300 scale-105 shadow-lg shadow-amber-400/20'
                  : 'bg-white/5 border-white/10 text-white/70'
              }`}
              style={{
                transform: `translateY(${(i % 3) * 4 - 4}px)`,
              }}
            >
              {city.split(',')[0]}
            </div>
          ))}
        </div>

        {/* Corner ornament: subtle dotted ring */}
        <div className="absolute top-0 right-0 w-24 h-24 border-2 border-dashed border-white/10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-2 border-dashed border-amber-400/20 rounded-full" />
      </div>
    </div>
  )
}
