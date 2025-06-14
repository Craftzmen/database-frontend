interface ButtonProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'solid' | 'outlined' | 'danger';
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function Button({
    children, 
    icon, 
    onClick, 
    className = "",
    variant = 'solid',
    disabled = false,
    size = 'md',
    ...props
}: ButtonProps) {
    
    const baseStyles = "cursor-pointer inline-flex items-center justify-center font-medium rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeStyles = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };
    
    const variantStyles = {
        solid: "bg-black text-white hover:bg-gray-500",
        outlined: "border border-black text-black bg-transparent hover:bg-black hover:text-white",
        danger: "border border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white"
    };
    
    const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
    
    return (
        <button 
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {icon && (
                <span className="mr-2 flex-shrink-0">
                    {icon}
                </span>
            )}
            {children}
        </button>
    );
}