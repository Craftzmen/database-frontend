'use client'
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, X } from "lucide-react";
import Checkbox from "../checkbox";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  placeholder?: string;
  onChange: (values: string[]) => void;
  onSearchChange?: (searchValue: string, hasResults: boolean) => void;
  selectedValues?: string[];
  disabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  placeholder = "Select options",
  onChange,
  onSearchChange,
  disabled,
  selectedValues = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [internalSelectedValues, setInternalSelectedValues] = useState<string[]>([]);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const safeSelectedValues = Array.isArray(selectedValues) ? selectedValues : [];
    setInternalSelectedValues(safeSelectedValues);
  }, [selectedValues]);

  useEffect(() => {
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredOptions(filtered);
    onSearchChange?.(search, filtered.length > 0);
  }, [search, options, onSearchChange]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - buttonRect.bottom;
      
      const minDropdownHeight = 94; 
      
      const estimatedItemsHeight = Math.min(filteredOptions.length * 36, 180);
      const estimatedDropdownHeight = 42 + estimatedItemsHeight + 16;
      
      const requiredHeight = Math.max(minDropdownHeight, estimatedDropdownHeight);
      
      setOpenUpwards(spaceBelow < requiredHeight);
    }
  }, [isOpen, filteredOptions.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    const newSelectedValues = internalSelectedValues.includes(value)
      ? internalSelectedValues.filter(val => val !== value)
      : [...internalSelectedValues, value];

    setInternalSelectedValues(newSelectedValues);
    onChange(newSelectedValues);
  };

  const removeValue = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newSelectedValues = internalSelectedValues.filter(val => val !== value);
    setInternalSelectedValues(newSelectedValues);
    onChange(newSelectedValues);
  };

  const getSelectedLabels = (): string[] => {
    if (!Array.isArray(internalSelectedValues)) return [];
    return internalSelectedValues
      .map(value => options.find(opt => opt.value === value)?.label)
      .filter((label): label is string => label !== undefined);
  };

  return (
    <div ref={containerRef} className="relative w-full text-sm">
      {label && <label className="block text-base font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <button
          ref={buttonRef}
          className="w-full px-3 py-2 border border-[#D7DEE9] rounded-xl text-[#5A5D72] text-left bg-white focus:border-2 focus:border-black transition min-h-12"
          onClick={(e) => {
            e.stopPropagation();
            !disabled && setIsOpen(!isOpen);
          }}
          disabled={disabled}
        >
          {internalSelectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {internalSelectedValues.map((value) => {
                const option = options.find(opt => opt.value === value);
                return option ? (
                  <div
                    key={value}
                    className="flex items-center bg-gray-100 rounded-md px-2 py-1 text-xs"
                  >
                    <span className="mr-1">{option.label}</span>
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(value);
                      }}
                    />
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            <span className="text-[#5A5D72]">{placeholder}</span>
          )}
        </button>
        <div className="absolute top-1/2 -translate-y-1/2 right-4">
          <ChevronDown size={16} />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: openUpwards ? 5 : -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openUpwards ? 5 : -5 }}
            transition={{ duration: 0.2 }}
            className={`absolute w-full bg-white overflow-hidden border border-[#D7DEE9] rounded-lg shadow-lg z-10 ${
              openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}
            style={{
              maxHeight: '250px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 border-b border-gray-200 focus:outline-none"
                disabled={disabled}
                autoFocus
              />
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-4 size-4" />
            </div>
            <div className="max-h-52 divide-y overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                    onClick={() => handleSelect(option.value)}
                  >
                    <Checkbox
                      id={''}
                      checked={internalSelectedValues.includes(option.value)}
                      onChange={() => { }}
                    />
                    {option.label}
                  </div>
                ))
              ) : (
                <p className="p-4 text-gray-500 text-sm">No options found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiSelect;