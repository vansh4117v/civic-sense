import React from 'react';

const AuthNavbar = () => {
  return (
    <header className="bg-card shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            cF
          </div>
          <span className="ml-2 text-xl font-bold text-foreground">civicSense</span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Need access? Contact your administrator.
        </div>
      </div>
    </header>
  );
};

export default AuthNavbar;