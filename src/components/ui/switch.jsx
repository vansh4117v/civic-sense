import React from 'react';

const Switch = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className={`sr-only peer`}
        ref={ref}
        {...props}
      />
      <div className={`w-11 h-6 bg-input peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary ${className}`}>
      </div>
    </div>
  );
});

Switch.displayName = "Switch";

export { Switch };