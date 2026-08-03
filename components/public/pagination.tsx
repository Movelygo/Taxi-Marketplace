import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  searchParams: Record<string, string | string[] | undefined>
}

export function Pagination({ currentPage, totalPages, basePath, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null

  // Build query string preserving all filters except page
  function buildPageUrl(page: number): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === 'page' || !value) continue
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v))
      } else {
        params.set(key, value)
      }
    }
    if (page > 1) {
      params.set('page', String(page))
    }
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  // Show max 5 page numbers around current
  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, start + 4)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          aria-label="Previous page"
        >
          ←
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
          ←
        </span>
      )}

      {/* Page numbers */}
      {start > 1 && (
        <>
          <Link
            href={buildPageUrl(1)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            1
          </Link>
          {start > 2 && <span className="px-2 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={buildPageUrl(p)}
          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            p === currentPage
              ? 'bg-[#0B1F3D] text-white border-[#0B1F3D]'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {p}
        </Link>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
          <Link
            href={buildPageUrl(totalPages)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          aria-label="Next page"
        >
          →
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
          →
        </span>
      )}
    </nav>
  )
}
