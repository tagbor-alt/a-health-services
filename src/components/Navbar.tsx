import React from "react";
import { Home, BookOpen, MessageSquare, User, MapPin, NotebookPen } from "lucide-react";
import { LanguageCode } from "../types";
import { getTranslation } from "../lib/i18n";

export type NavTab = "home" | "diary" | "learn" | "chat" | "profile" | "nearby";

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  lang: LanguageCode;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, lang }) => {
  const tabs: { id: NavTab; labelKey: string; icon: React.ReactNode }[] = [
    { id: "home", labelKey: "navHome", icon: <Home size={18} /> },
    { id: "diary", labelKey: "navDiary", icon: <NotebookPen size={18} /> },
    { id: "nearby", labelKey: "navNearby", icon: <MapPin size={18} /> },
    { id: "learn", labelKey: "navLearn", icon: <BookOpen size={18} /> },
    { id: "chat", labelKey: "navAI", icon: <MessageSquare size={18} /> },
    { id: "profile", labelKey: "navProfile", icon: <User size={18} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center py-2 px-1 z-40 shadow-lg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 text-[11px] font-medium py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              isActive
                ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                : "text-[var(--muted)] hover:text-[var(--primary)] hover:bg-slate-100/60"
            }`}
          >
            {tab.icon}
            <span className="text-[10px]">{getTranslation(lang, tab.labelKey)}</span>
          </button>
        );
      })}
    </nav>
  );
};
