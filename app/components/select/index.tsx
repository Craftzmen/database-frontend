import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  value?: string; 
};

const Select = ({
  options,
  onChange,
  placeholder = "Select an option",
  className = "",
  value: controlledValue,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      const selectedOption = options.find((option) => option.value === controlledValue);
      setSelected(selectedOption || null);
    }
  }, [controlledValue, options]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - buttonRect.bottom;
      const dropdownHeight = options.length * 36;
      
      setOpenUpwards(spaceBelow < dropdownHeight + 8);
    }
  }, [isOpen, options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    setSelected(option);
    onChange(option.value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className="min-w-36 lg:min-w-40 w-full flex justify-between items-center px-4 py-2 bg-white border border-[#D7DEE9] rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <ul
          className={`divide-y absolute z-10 w-full bg-white border border-[#D7DEE9] rounded-lg shadow-lg overflow-hidden ${
            openUpwards ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          role="listbox"
          style={{
            maxHeight: "240px",
            overflowY: "auto"
          }}
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={selected?.value === option.value}
              className="px-4 py-2 cursor-pointer hover:bg-[#E2E3E9] transition text-sm"
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;