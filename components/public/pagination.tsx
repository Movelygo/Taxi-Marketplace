interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) return null

  // Show max 5 page numbers around current
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage <= 1}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        ←
      </button>

      {/* Page numbers */}
      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={disabled}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            1
          </button>
          {start > 2 && <span className="px-2 text-gray-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          type="button"
          key={p}
          onClick={() => onPageChange(p)}
          disabled={disabled || p === currentPage}
          aria-current={p === currentPage ? 'page' : undefined}
          className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors disabled:cursor-default ${
            p === currentPage
              ? 'bg-[#0B1F3D] text-white border-[#0B1F3D]'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-400">…</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={disabled}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  )
}
