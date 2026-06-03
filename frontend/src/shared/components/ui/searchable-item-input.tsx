import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { formatCurrency } from '@/shared/lib/format';

interface ItemOption {
  id: string;
  name: string;
  price: number;
  sku?: string;
}

interface SearchableItemInputProps {
  value: string;
  options: ItemOption[];
  onSelect: (description: string, price: number, itemId?: string) => void;
  onChange?: (text: string) => void;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  pageSize?: number;
}

export const SearchableItemInput = React.forwardRef<HTMLDivElement, SearchableItemInputProps>(
  ({
    value,
    options,
    onSelect,
    onChange,
    isLoading,
    onSearch,
    pageSize = 8,
  }, ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [page, setPage] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync from parent if value changes (e.g. initial load or reset)
    useEffect(() => {
      setSearchTerm(value);
    }, [value]);

    // Calculate dropdown position
    useEffect(() => {
      if (isOpen && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

    const filteredOptions = options.filter((opt) =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.sku?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );

    const totalPages = Math.ceil(filteredOptions.length / pageSize);
    const paginatedOptions = filteredOptions.slice(
      page * pageSize,
      (page + 1) * pageSize
    );

    const handleSearch = (query: string) => {
      setSearchTerm(query);
      setPage(0);
      onChange?.(query);
      onSearch?.(query);
    };

    const handleSelectOption = (option: ItemOption) => {
      onSelect(option.name, option.price, option.id);
      setIsOpen(false);
      setSearchTerm(option.name);
      onChange?.(option.name);
      setPage(0);
    };

    const handleClear = () => {
      setSearchTerm('');
      onChange?.('');
      setPage(0);
      inputRef.current?.focus();
    };

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        inputRef.current?.focus();
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
      <div ref={containerRef} className="w-full relative">
        <div className="relative">
          <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari atau ketik deskripsi item..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className={cn(
              'w-full pl-9 pr-9 py-1.5 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent transition-colors',
              isOpen && 'ring-1 ring-primary-500 border-transparent'
            )}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {isOpen && (
          <div
            className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            <div className="max-h-56 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size={20} className="animate-spin text-primary-600" />
                </div>
              ) : paginatedOptions.length === 0 ? (
                <div className="py-4 px-3 text-center text-sm text-gray-500">
                  {searchTerm ? 'Tidak ada hasil ditemukan' : 'Mulai mengetik untuk mencari'}
                </div>
              ) : (
                <ul className="space-y-0">
                  {paginatedOptions.map((option) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectOption(option)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-gray-900">{option.name}</span>
                          {option.sku && (
                            <span className="text-xs text-gray-500">SKU: {option.sku}</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-primary-700">
                          {formatCurrency(option.price)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {totalPages > 1 && (
              <div className="border-t border-gray-100 px-3 py-1.5 flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Halaman {page + 1} dari {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-2 py-0.5 border border-gray-300 rounded text-xs disabled:opacity-50 hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="px-2 py-0.5 border border-gray-300 rounded text-xs disabled:opacity-50 hover:bg-gray-50"
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

SearchableItemInput.displayName = 'SearchableItemInput';
