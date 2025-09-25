import React from 'react';

const Badge = React.forwardRef(({ 
  className = "", 
  variant = "default", 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary-foreground",
    destructive: "bg-destructive/10 text-destructive",
    outline: "text-foreground border border-input",
    success: "bg-success/10 text-success"
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export { Badge };