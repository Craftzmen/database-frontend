import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";

type CheckboxProps = {
  id: string | number;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
};

export default function Checkbox({ id, checked = false, onChange, label }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const toggleCheckbox = () => {
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    if (onChange) onChange(newChecked);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id as string}
        checked={isChecked}
        onChange={toggleCheckbox}
        className="absolute opacity-0 w-6 h-6 cursor-pointer"
      />
      <motion.div
        className="w-4.5 h-4.5 rounded border border-gray-400/50 flex items-center justify-center cursor-pointer"
        initial={{ backgroundColor: "#fff" }}
        animate={{ backgroundColor: isChecked ? "#000000" : "#fff" }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {isChecked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Check className="text-white w-4 h-4" />
          </motion.div>
        )}
      </motion.div>
      {label && (
        <label htmlFor={id as string} className="text-gray-700 select-none cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}