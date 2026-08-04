'use client'

import { useState, useRef, useEffect, useMemo, useId } from 'react'

export interface SearchableOption {
  value: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  options: SearchableOption[]
  name: string
  id?: string
  placeholder?: string
  required?: boolean
  defaultValue?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
  emptyMessage?: string
}

export function SearchableSelect({
  options,
  name,
  id,
  placeholder = 'Search...',
  required = false,
  defaultValue = '',
  value,
  onChange,
  disabled = false,
  className = '',
  emptyMessage = 'No results found',
}: SearchableSelectProps) {
  const generatedId = useId()
  const inputId = id || generatedId

  // Controlled mode if value + onChange are provided, otherwise uncontrolled
  const isControlled = value !== undefined && onChange !== undefined

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedValue = isControlled ? value! : internalValue

  // Find the selected option's label for display when closed
  const selectedOption = useMemo(
    () => options.find((o) => o.value === selectedValue),
    [options, selectedValue]
  )

  // Filter options based on query
  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.sublabel?.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q)
    )
  }, [options, query])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setQuery('')
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex, isOpen])

  function handleOpen() {
    if (disabled) return
    if (!isOpen) {
      setIsOpen(true)
      setQuery('')
      setHighlightedIndex(-1)
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSelect(option: SearchableOption) {
    if (isControlled) {
      onChange!(option.value)
    } else {
      setInternalValue(option.value)
    }
    setIsOpen(false)
    setQuery('')
    setHighlightedIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        handleOpen()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          handleSelect(filtered[highlightedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setQuery('')
        setHighlightedIndex(-1)
        break
    }
  }

  const displayText = isOpen ? query : (selectedOption?.label ?? '')

  return (
    <div ref={containerRef} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selectedValue} required={required} />

      {/* Search input / display */}
      <div
        onClick={handleOpen}
        className={`w-full px-4 py-2.5 border rounded-xl bg-white cursor-pointer flex items-center justify-between gap-2 transition-all ${
          isOpen
            ? 'border-[#0B1F3D] ring-4 ring-[#0B1F3D]/5'
            : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={displayText}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlightedIndex(0)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedOption ? `${selectedOption.label}${selectedOption.sublabel ? `, ${selectedOption.sublabel}` : ''}` : placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400 cursor-pointer"
          autoComplete="off"
        />
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">{emptyMessage}</div>
          ) : (
            filtered.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  highlightedIndex === index
                    ? 'bg-[#0B1F3D] text-white'
                    : option.value === selectedValue
                      ? 'bg-blue-50 text-blue-900'
                      : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                {option.sublabel && (
                  <div className={`text-xs ${highlightedIndex === index ? 'text-white/70' : 'text-gray-500'}`}>
                    {option.sublabel}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
