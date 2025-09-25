import React from 'react';

const Card = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-xl border border-border bg-card text-card-foreground shadow ${className}`}
      {...props}
    />
  );
});

Card.displayName = "Card";

export { Card };

export const CardHeader = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  );
});

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <h3
      ref={ref}
      className={`font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  );
});

CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <p
      ref={ref}
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    />
  );
});

CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`}
      {...props}
    />
  );
});

CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef(({ 
  className = "", 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    />
  );
});

CardFooter.displayName = "CardFooter";