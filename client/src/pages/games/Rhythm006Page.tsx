import React, { lazy, Suspense } from "react";

// Lazy load the game component for better bundle splitting
const Rhythm006Game = lazy(() => import("@/components/Rhythm006Game").then(module => ({ 
  default: module.Rhythm006Game 
})));

export const Rhythm006Page: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-purple-700 text-xl font-semibold">Loading Beat & Pulse Trainer...</div>
      </div>
    }>
      <Rhythm006Game />
    </Suspense>
  );
};

export default Rhythm006Page;
