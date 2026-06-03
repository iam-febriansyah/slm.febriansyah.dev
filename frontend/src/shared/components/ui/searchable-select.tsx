import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Loader } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface Option {
  id: string;
  label: string;
  description?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  required?: boolean;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  pageSize?: number;
}

export const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(
  ({
    options,
    value,
    onChange,
    placeholder = 'Pilih opsi',
    searchPlaceholder = 'Cari...',
    label,
    required,
    isLoading,
    onSearch,
    pageSize = 10,
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);

    const filteredOptions = options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

    const totalPages = Math.ceil(filteredOptions.length / pageSize);
    const paginatedOptions = filteredOptions.slice(
      page * pageSize,
      (page + 1) * pageSize
    );

    // Calculate dropdown position
    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

    const handleSearch = (query: string) => {
      setSearchTerm(query);
      setPage(0);
      onSearch?.(query);
    };

    const handleSelect = (id: string) => {
      onChange(id);
      setIsOpen(false);
      setSearchTerm('');
      setPage(0);
    };

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        searchInputRef.current?.focus();
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
      <div ref={containerRef} className="w-full relative">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-danger">*</span>}
          </label>
        )}
        <button
          type="button"
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors flex items-center justify-between',
            isOpen && 'ring-2 ring-primary-500 border-transparent'
          )}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div
            className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size={20} className="animate-spin text-primary-600" />
                </div>
              ) : paginatedOptions.length === 0 ? (
                <div className="py-6 px-3 text-center text-sm text-gray-500">
                  Tidak ada hasil ditemukan
                </div>
              ) : (
                <ul className="space-y-0">
                  {paginatedOptions.map((option) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(option.id)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 text-sm hover:bg-primary-50 transition-colors flex flex-col gap-0.5',
                          value === option.id && 'bg-primary-100'
                        )}
                      >
                        <span className="font-medium text-gray-900">{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-gray-500">{option.description}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {totalPages > 1 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-100 px-3 py-2 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Halaman {page + 1} dari {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="px-2 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

SearchableSelect.displayName = 'SearchableSelect';
