import React from "react";
import TempoPulseMasterGame from "@/components/TempoPulseMasterGame";
import { useLocation } from "wouter";

export const Rhythm002Page: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/games");
  };

  return <TempoPulseMasterGame onBack={handleBack} />;
};

export default Rhythm002Page;