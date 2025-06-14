'use client'
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  label?: string;
  options: Option[];
  placeholder?: string;
  onChange: (value: string | Option) => void;
  value?: string | Option | null;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ 
  label, 
  options, 
  placeholder = "Select an option", 
  onChange,
  value
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, options]);

  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        setSelectedValue(value);
      } else {
        setSelectedValue(value.value);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedValue(option.value);
    setIsOpen(false);
    setSearch("");
    onChange(option); 
  };

  const displayValue = selectedValue 
    ? options.find((opt) => opt.value === selectedValue)?.label 
    : placeholder;

  return (
    <div ref={containerRef} className="relative w-full text-sm">
      {label && <label className="block font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <button
          className="w-full px-3 py-2 border border-[#D7DEE9] rounded-lg text-[#5A5D72] text-left bg-white focus:ring-2 focus:ring-primary focus:border-black transition"
          onClick={() => setIsOpen(!isOpen)}
        >
          {displayValue}
        </button>
        <div className="absolute top-1/2 -translate-y-1/2 right-4">
          <ChevronDown size={16} />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute w-full mt-2 bg-white overflow-hidden border border-[#D7DEE9] rounded-lg shadow-lg z-10"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 border-b border-gray-200 focus:outline-none"
              />
              <Search size={20} className="absolute top-1/2 -translate-y-1/2 right-4 size-4" />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelect(option)}
                  >
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

export default SearchableSelect;