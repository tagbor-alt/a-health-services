import React from "react";
import { ArrowLeft } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onBack, rightElement }) => {
  return (
    <header className="bg-[var(--primary)] text-white p-5 flex items-center justify-between shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="text-white p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="font-serif text-2xl font-normal leading-tight">{title}</h1>
          {subtitle && <p className="text-xs opacity-75 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  );
};

